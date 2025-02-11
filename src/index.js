import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";
import { TARGET_TYPE, REPORT_TYPE } from "./const";

const SEARCH_ISSUES_MAX_RESULTS = 100;

const resolver = new Resolver();

const clauseName = (id) => {
  const CUSTOM_FIELD_PREFIX = "customfield_";
  if (id.startsWith(CUSTOM_FIELD_PREFIX)) {
    return `cf[${id.slice(CUSTOM_FIELD_PREFIX.length)}]`;
  } else {
    return id;
  }
};

resolver.define("getRecentProjects", async (req) => {
  const response = await api
    .asUser()
    .requestJira(route`/rest/api/3/project/recent`, {
      headers: {
        Accept: "application/json",
      },
    });
  return await response.json();
});

resolver.define("getIssueTypes", async (req) => {
  const response = await api
    .asUser()
    .requestJira(route`/rest/api/3/issuetype`, {
      headers: {
        Accept: "application/json",
      },
    });
  return await response.json();
});

resolver.define("getProjectIssueTypes", async (req) => {
  const { projectId } = req.payload;
  const response = await api
    .asUser()
    .requestJira(route`/rest/api/3/issuetype/project?projectId=${projectId}`, {
      headers: {
        Accept: "application/json",
      },
    });
  return await response.json();
});

resolver.define("getNumberFields", async (req) => {
  const response = await api.asUser().requestJira(route`/rest/api/3/field`, {
    headers: {
      Accept: "application/json",
    },
  });
  return (await response.json()).filter(
    (field) => field.schema && field.schema.type === "number"
  );
});

resolver.define("getCustomReportTypeFields", async (req) => {
  const response = await api.asUser().requestJira(route`/rest/api/3/field`, {
    headers: {
      Accept: "application/json",
    },
  });
  return (await response.json()).filter(
    (field) =>
      field.schema &&
      (field.schema.type === "number" || field.schema.type === "option")
  );
});

resolver.define("getDateTimeFields", async (req) => {
  const response = await api.asUser().requestJira(route`/rest/api/3/field`, {
    headers: {
      Accept: "application/json",
    },
  });
  return (await response.json()).filter(
    (field) =>
      field.schema?.type === "datetime" || field.schema?.type === "date"
  );
});

resolver.define("searchIssues", async (req) => {
  const {
    project,
    issueType,
    numberField,
    customReportTypeField,
    dateTimeField,
    reportType,
    targetType,
    dateFromStr,
    dateToStr,
    isCumulative,
  } = req.payload;

  const sprintField = await getSprintFieldId();
  const dateFrom = new Date(dateFromStr);
  const dateTo = new Date(dateToStr);
  const dateToForQuery = new Date(dateToStr);
  dateToForQuery.setDate(dateToForQuery.getDate() + 1);

  const issueTypesCondition = (issueTypes) => {
    if (issueType.length === 0) return "";
    let condition = "";
    issueTypes.forEach((issueType, index) => {
      if (index === 0) {
        condition = `and (issueType = '${issueType}'`;
      } else {
        condition = `${condition} or issueType = '${issueType}'`;
      }
    });
    condition = `${condition})`;
    return condition;
  };

  const jql = isCumulative
    ? `project = ${project} ${issueTypesCondition(
        issueType
      )} and ((resolutiondate >= ${createTermCondition(
        dateFrom
      )} and resolutiondate < ${createTermCondition(
        dateToForQuery
      )} and statusCategory = Done) or statusCategory != Done) order by created DESC`
    : `project = ${project} ${issueTypesCondition(issueType)} and ${clauseName(
        numberField
      )} >= 0 and ${clauseName(dateTimeField)} >= ${createTermCondition(
        dateFrom
      )} and ${clauseName(dateTimeField)} < ${createTermCondition(
        dateToForQuery
      )} order by ${clauseName(dateTimeField)} DESC`;

  const body = {
    fields: [
      numberField,
      dateTimeField,
      sprintField,
      "created",
      "resolutiondate",
    ]
      .concat(
        targetType === TARGET_TYPE.ASSIGNEE ? ["assignee"] : ["issuetype"]
      )
      .concat(reportType === REPORT_TYPE.CUSTOM ? [customReportTypeField] : []),
    fieldsByKeys: false,
    jql: jql,
    maxResults: SEARCH_ISSUES_MAX_RESULTS,
    startAt: 0,
  };

  const issues = await searchIssuesRecursive(body, 0, []);

  const extractLastNumber = (str) => {
    const match = str.match(/\d+$/);
    return match ? Number(match[0]) : null;
  };

  issues.forEach((issue) => {
    if (issue.fields[sprintField]) {
      const latestSprintNumber = Math.max(
        ...issue.fields[sprintField]
          .map((sprint) => sprint.name)
          .map(extractLastNumber)
      );
      const latestSprint = issue.fields[sprintField].find(
        (sprint) => extractLastNumber(sprint.name) == latestSprintNumber
      );
      issue.fields["sprintNumber"] = latestSprintNumber;
      issue.fields["sprint"] = latestSprint;
    }
  });

  return isCumulative
    ? createCumulativeResponseValue(issues, reportType, dateFrom, dateTo)
    : createResponseValue(
        issues,
        numberField,
        customReportTypeField,
        dateTimeField,
        reportType,
        targetType,
        dateFrom,
        dateTo
      );
});

const getSprintFieldId = async () => {
  const response = await api.asUser().requestJira(route`/rest/api/3/field`, {
    headers: {
      Accept: "application/json",
    },
  });
  const sprintFields = (await response.json()).filter(
    (field) => field.name === "Sprint"
  );
  return sprintFields[0]?.id;
};

const searchIssuesRecursive = async (body, startAt, acc) => {
  body.startAt = startAt;
  const response = await api.asUser().requestJira(route`/rest/api/3/search`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (json.startAt + json.maxResults < json.total) {
    return searchIssuesRecursive(
      body,
      startAt + SEARCH_ISSUES_MAX_RESULTS,
      acc.concat(json.issues ?? [])
    );
  } else {
    return acc.concat(json.issues ?? []);
  }
};

const unique = (value, index, array) => array.indexOf(value) === index;

const createCumulativeResponseValue = (
  issues,
  reportType,
  dateFrom,
  dateTo
) => {
  const targetValues = ["DONE", "TODO / DOING"];
  const minSprint = Math.min(
    ...issues
      .filter((issue) => issue.fields["sprintNumber"])
      .map((issue) => issue.fields["sprintNumber"] ?? 0)
  );
  const maxSprint = Math.max(
    ...issues
      .filter((issue) => issue.fields["sprintNumber"])
      .map((issue) => issue.fields["sprintNumber"] ?? 0)
  );
  const sprintMap = {};
  const sprintDateMap = {};
  issues.forEach((issue) => {
    if (issue.fields["sprintNumber"]) {
      sprintMap[issue.fields["sprintNumber"]] =
        issue.fields["sprint"]?.startDate;
      sprintDateMap[new Date(issue.fields["sprint"]?.startDate).getTime()] =
        issue.fields["sprintNumber"];
    }
  });
  const store =
    reportType === REPORT_TYPE.MONTHLY
      ? initMonthlyStore(targetValues, new Date(dateFrom), new Date(dateTo))
      : reportType === REPORT_TYPE.WEEKLY
      ? initWeeklyStore(targetValues, new Date(dateFrom), new Date(dateTo))
      : reportType === REPORT_TYPE.DAILY
      ? initDailyStore(targetValues, new Date(dateFrom), new Date(dateTo))
      : reportType === REPORT_TYPE.SPRINT
      ? initSprintStore(targetValues, minSprint, maxSprint)
      : initMonthlyStore(targetValues, new Date(dateFrom), new Date(dateTo));
  const targetDates =
    reportType === REPORT_TYPE.MONTHLY
      ? monthlyTargetDates(new Date(dateFrom), new Date(dateTo))
      : reportType === REPORT_TYPE.WEEKLY
      ? weeklyTargetDates(new Date(dateFrom), new Date(dateTo))
      : reportType === REPORT_TYPE.DAILY
      ? dailyTargetDates(new Date(dateFrom), new Date(dateTo))
      : reportType === REPORT_TYPE.SPRINT
      ? sprintTargetDates(sprintMap, minSprint, maxSprint)
      : monthlyTargetDates(new Date(dateFrom), new Date(dateTo));
  for (let i = 0; i < targetDates.length - 1; i++) {
    issues.forEach((issue) => {
      const date = targetDates[i + 1].getTime();
      const sprint = sprintDateMap[targetDates[i + 1].getTime()];
      const term =
        reportType === REPORT_TYPE.MONTHLY
          ? createMonthlyTermKey(new Date(date))
          : reportType === REPORT_TYPE.WEEKLY
          ? createWeeklyTermKey(new Date(date))
          : reportType === REPORT_TYPE.DAILY
          ? createDailyTermKey(new Date(date))
          : reportType === REPORT_TYPE.SPRINT
          ? `Sprint ${sprint}`
          : createMonthlyTermKey(new Date(date));
      if (
        store[`${term}-DONE`] &&
        store[`${term}-TODO / DOING`] &&
        targetDates[i].getTime() > new Date(issue.fields.created).getTime()
      ) {
        if (
          issue.fields.resolutiondate &&
          targetDates[i].getTime() >
            new Date(issue.fields.resolutiondate).getTime()
        ) {
          store[`${term}-DONE`].count++;
        } else {
          store[`${term}-TODO / DOING`].count++;
        }
      }
    });
  }
  return Object.keys(store)
    .sort()
    .map((key) => store[key])
    .sort((a, b) => Number(a.order) - Number(b.order));
};

const createResponseValue = (
  issues,
  numberField,
  customReportTypeField,
  dateTimeField,
  reportType,
  targetType,
  dateFrom,
  dateTo
) => {
  const targetValues =
    targetType === TARGET_TYPE.ASSIGNEE
      ? assigneeNames(issues)
      : issueTypes(issues);
  const minSprint = Math.min(
    ...issues
      .filter((issue) => issue.fields["sprintNumber"])
      .map((issue) => issue.fields["sprintNumber"] ?? 0)
  );
  const maxSprint = Math.max(
    ...issues
      .filter((issue) => issue.fields["sprintNumber"])
      .map((issue) => issue.fields["sprintNumber"] ?? 0)
  );
  const customReportTypeOptions =
    reportType === REPORT_TYPE.CUSTOM &&
    customReportTypeField &&
    issues
      .map((issue) =>
        Number.isFinite(issue.fields[customReportTypeField])
          ? issue.fields[customReportTypeField]
          : issue.fields[customReportTypeField]?.value
      )
      .filter((value) => value !== undefined)
      .filter(unique);
  const store =
    reportType === REPORT_TYPE.MONTHLY
      ? initMonthlyStore(targetValues, new Date(dateFrom), new Date(dateTo))
      : reportType === REPORT_TYPE.WEEKLY
      ? initWeeklyStore(targetValues, new Date(dateFrom), new Date(dateTo))
      : reportType === REPORT_TYPE.DAILY
      ? initDailyStore(targetValues, new Date(dateFrom), new Date(dateTo))
      : reportType === REPORT_TYPE.SPRINT
      ? initSprintStore(targetValues, minSprint, maxSprint)
      : initCustomFieldStore(targetValues, customReportTypeOptions);
  issues.forEach((issue) => {
    const value = issue.fields[numberField];
    const date = issue.fields[dateTimeField];
    const sprint = issue.fields["sprintNumber"];
    const customFieldValue = Number.isFinite(
      issue.fields[customReportTypeField]
    )
      ? issue.fields[customReportTypeField]
      : issue.fields[customReportTypeField]?.value;
    const term =
      reportType === REPORT_TYPE.MONTHLY
        ? createMonthlyTermKey(new Date(date))
        : reportType === REPORT_TYPE.WEEKLY
        ? createWeeklyTermKey(new Date(date))
        : reportType === REPORT_TYPE.DAILY
        ? createDailyTermKey(new Date(date))
        : reportType === REPORT_TYPE.SPRINT
        ? `Sprint ${sprint}`
        : customFieldValue;
    if (targetType === TARGET_TYPE.ASSIGNEE) {
      const assigneeName = issue.fields.assignee?.displayName ?? "Unassigned";
      const assigneeKey = `${term}-${assigneeName}`;
      if (store[assigneeKey]) {
        store[assigneeKey].count++;
        store[assigneeKey].sum += value;
      }
    } else {
      const issueType = issue.fields.issuetype.name;
      const issueKey = `${term}-${issueType}`;
      if (store[issueKey]) {
        store[issueKey].count++;
        store[issueKey].sum += value;
      }
    }
  });
  return Object.keys(store)
    .sort()
    .map((key) => store[key])
    .sort((a, b) => Number(a.order) - Number(b.order));
};

const issueTypes = (issues) => {
  const ret = issues.map((issue) => issue.fields.issuetype.name).filter(unique);
  return ret;
};

const assigneeNames = (issues) => {
  return issues
    .map((issue) => issue.fields.assignee?.displayName ?? "Unassigned")
    .filter(unique);
};

const createTermCondition = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createMonthlyTermKey = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
};

const createWeeklyTermKey = (date) => {
  // shift to Monday
  if (date.getDay() === 0) {
    date.setDate(date.getDate() - 6);
  } else if (date.getDay() > 1) {
    date.setDate(date.getDate() - date.getDay() + 1);
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createDailyTermKey = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const initMonthlyStore = (targetValues, dateFrom, dateTo) => {
  const store = {};
  dateFrom.setHours(0, 0, 0, 0);
  dateTo.setHours(0, 0, 0, 0);
  while (dateTo >= dateFrom) {
    const term = createMonthlyTermKey(dateTo);
    targetValues.forEach((targetValue) => {
      const key = `${term}-${targetValue}`;
      store[key] = {
        term: term,
        order: Number(term.replaceAll("-", "")),
        count: 0,
        sum: 0,
        target: targetValue,
      };
    });
    dateTo.setMonth(dateTo.getMonth() - 1);
  }
  return store;
};

const initWeeklyStore = (targetValues, dateFrom, dateTo) => {
  const store = {};
  dateFrom.setHours(0, 0, 0, 0);
  dateTo.setHours(0, 0, 0, 0);
  dateFrom.setDate(dateFrom.getDate() - 6);
  while (dateTo >= dateFrom) {
    const term = createWeeklyTermKey(dateTo);
    targetValues.forEach((targetValue) => {
      const key = `${term}-${targetValue}`;
      store[key] = {
        term: term,
        order: Number(term.replaceAll("-", "")),
        count: 0,
        sum: 0,
        target: targetValue,
      };
    });
    dateTo.setDate(dateTo.getDate() - 7);
  }
  return store;
};

const initDailyStore = (targetValues, dateFrom, dateTo) => {
  const store = {};
  dateFrom.setHours(0, 0, 0, 0);
  dateTo.setHours(0, 0, 0, 0);
  dateFrom.setDate(dateFrom.getDate());
  while (dateTo >= dateFrom) {
    const term = createDailyTermKey(dateTo);
    targetValues.forEach((targetValue) => {
      const key = `${term}-${targetValue}`;
      store[key] = {
        term: term,
        order: Number(term.replaceAll("-", "")),
        count: 0,
        sum: 0,
        target: targetValue,
      };
    });
    dateTo.setDate(dateTo.getDate() - 1);
  }
  return store;
};

const initSprintStore = (targetValues, minSprint, maxSprint) => {
  const store = {};
  for (let sprint = maxSprint; sprint >= minSprint; sprint--) {
    targetValues.forEach((targetValue) => {
      const term = `Sprint ${sprint}`;
      const key = `${term}-${targetValue}`;
      store[key] = {
        term: term,
        order: sprint,
        count: 0,
        sum: 0,
        target: targetValue,
      };
    });
  }
  return store;
};

const initCustomFieldStore = (targetValues, customReportTypeOptions) => {
  const store = {};
  customReportTypeOptions.forEach((option) => {
    targetValues.forEach((targetValue) => {
      const term = `${option}`;
      const key = `${term}-${targetValue}`;
      store[key] = {
        term: term,
        order: option,
        count: 0,
        sum: 0,
        target: targetValue,
      };
    });
  });
  return store;
};

const monthlyTargetDates = (dateFrom, dateTo) => {
  let targets = [];
  dateFrom.setHours(0, 0, 0, 0);
  dateTo.setHours(0, 0, 0, 0);
  dateFrom.setDate(1);
  dateTo.setDate(1);
  dateTo.setMonth(dateTo.getMonth() + 1);
  while (dateTo >= dateFrom) {
    targets.push(new Date(dateTo.getTime()));
    dateTo.setMonth(dateTo.getMonth() - 1);
  }
  return targets;
};

const weeklyTargetDates = (dateFrom, dateTo) => {
  let targets = [];
  dateFrom.setHours(0, 0, 0, 0);
  dateTo.setHours(0, 0, 0, 0);
  dateFrom.setDate(dateFrom.getDate() - 6);
  dateTo.setDate(dateTo.getDate() + 7);
  while (dateTo >= dateFrom) {
    const term = createWeeklyTermKey(dateTo);
    targets.push(new Date(term));
    dateTo.setDate(dateTo.getDate() - 7);
  }
  return targets;
};

const dailyTargetDates = (dateFrom, dateTo) => {
  let targets = [];
  dateFrom.setHours(0, 0, 0, 0);
  dateTo.setHours(0, 0, 0, 0);
  dateTo.setDate(dateTo.getDate() + 1);
  while (dateTo >= dateFrom) {
    targets.push(new Date(dateTo.getTime()));
    dateTo.setDate(dateTo.getDate() - 1);
  }
  return targets;
};

const sprintTargetDates = (sprintMap, minSprint, maxSprint) => {
  let targets = [new Date()];
  for (let sprint = maxSprint; sprint >= minSprint; sprint--) {
    const date = sprintMap[sprint];
    if (date) {
      targets.push(new Date(date));
    }
  }
  return targets;
};

export const handler = resolver.getDefinitions();
