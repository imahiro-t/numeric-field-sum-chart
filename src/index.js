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
        condition = `(issueType = ${issueType}`;
      } else {
        condition = `${condition} or issueType = ${issueType}`;
      }
    });
    condition = `${condition})`;
    return condition;
  };

  const jql =
    issueType.length > 0
      ? `project = ${project} and ${issueTypesCondition(
          issueType
        )} and ${clauseName(numberField)} >= 0 and ${clauseName(
          dateTimeField
        )} >= ${createTermCondition(dateFrom)} and ${clauseName(
          dateTimeField
        )} < ${createTermCondition(dateToForQuery)} order by ${clauseName(
          dateTimeField
        )} DESC`
      : `project = ${project} and ${clauseName(
          numberField
        )} >= 0 and ${clauseName(dateTimeField)} >= ${createTermCondition(
          dateFrom
        )} and ${clauseName(dateTimeField)} < ${createTermCondition(
          dateToForQuery
        )} order by ${clauseName(dateTimeField)} DESC`;

  const body = {
    fields: [numberField, dateTimeField, sprintField]
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
    return match ? match[0] : null;
  };

  issues.forEach((issue) => {
    if (issue.fields[sprintField]) {
      issue.fields[sprintField] = Math.max(
        ...issue.fields[sprintField]
          .map((sprint) => sprint.name)
          .map(extractLastNumber)
      );
    }
  });

  return createResponseValue(
    issues,
    numberField,
    customReportTypeField,
    dateTimeField,
    sprintField,
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

const createResponseValue = (
  issues,
  numberField,
  customReportTypeField,
  dateTimeField,
  sprintField,
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
      .filter((issue) => issue.fields[sprintField])
      .map((issue) => issue.fields[sprintField] ?? 0)
  );
  const maxSprint = Math.max(
    ...issues
      .filter((issue) => issue.fields[sprintField])
      .map((issue) => issue.fields[sprintField] ?? 0)
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
    reportType === REPORT_TYPE.WEEKLY
      ? initWeeklyStore(targetValues, new Date(dateFrom), new Date(dateTo))
      : reportType === REPORT_TYPE.MONTHLY
      ? initMonthlyStore(targetValues, new Date(dateFrom), new Date(dateTo))
      : reportType === REPORT_TYPE.SPRINT
      ? initSprintStore(targetValues, minSprint, maxSprint)
      : initCustomFieldStore(targetValues, customReportTypeOptions);
  issues.forEach((issue) => {
    const value = issue.fields[numberField];
    const date = issue.fields[dateTimeField];
    const sprint = issue.fields[sprintField];
    const customFieldValue = Number.isFinite(
      issue.fields[customReportTypeField]
    )
      ? issue.fields[customReportTypeField]
      : issue.fields[customReportTypeField]?.value;
    const term =
      reportType === REPORT_TYPE.WEEKLY
        ? createWeeklyTermKey(new Date(date))
        : reportType === REPORT_TYPE.MONTHLY
        ? createMonthlyTermKey(new Date(date))
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

const initSprintStore = (targetValues, minSprint, maxSprint) => {
  const store = {};
  for (var sprint = minSprint; sprint <= maxSprint; sprint++) {
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

export const handler = resolver.getDefinitions();
