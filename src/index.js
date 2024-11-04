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

resolver.define("getDateTimeFields", async (req) => {
  const response = await api.asUser().requestJira(route`/rest/api/3/field`, {
    headers: {
      Accept: "application/json",
    },
  });
  return (await response.json()).filter(
    (field) => field.schema && field.schema.type === "datetime"
  );
});

resolver.define("searchIssues", async (req) => {
  const {
    project,
    issueType,
    numberField,
    dateTimeField,
    reportType,
    targetType,
    dateFromStr,
    dateToStr,
  } = req.payload;

  const dateFrom = new Date(dateFromStr);
  const dateTo = new Date(dateToStr);
  const dateToFroQuery = new Date(dateToStr);
  dateToFroQuery.setDate(dateToFroQuery.getDate() + 1);

  const jql = issueType
    ? `project = ${project} and issueType = ${issueType} and ${clauseName(
        numberField
      )} >= 0 and ${clauseName(dateTimeField)} >= ${createTermCondition(
        dateFrom
      )} and ${clauseName(dateTimeField)} < ${createTermCondition(
        dateToFroQuery
      )} order by ${clauseName(dateTimeField)} DESC`
    : `project = ${project} and ${clauseName(
        numberField
      )} >= 0 and ${clauseName(dateTimeField)} >= ${createTermCondition(
        dateFrom
      )} and ${clauseName(dateTimeField)} < ${createTermCondition(
        dateToFroQuery
      )} order by ${clauseName(dateTimeField)} DESC`;

  const body = {
    fields: [numberField, dateTimeField, "issuetype", "assignee"],
    fieldsByKeys: false,
    jql: jql,
    maxResults: SEARCH_ISSUES_MAX_RESULTS,
    startAt: 0,
  };

  const issues = await searchIssuesRecursive(body, 0, []);

  return createResponseValue(
    issues,
    numberField,
    dateTimeField,
    issueType,
    reportType,
    targetType,
    dateFrom,
    dateTo
  );
});

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

const createResponseValue = (
  issues,
  numberField,
  dateTimeField,
  issueType,
  reportType,
  targetType,
  dateFrom,
  dateTo
) => {
  const targetValues =
    targetType === TARGET_TYPE.ASSIGNEE
      ? assigneeNames(issues)
      : issueTypes(issues, issueType);
  const store =
    reportType === REPORT_TYPE.WEEKLY
      ? initWeeklyStore(targetValues, new Date(dateFrom), new Date(dateTo))
      : initMonthlyStore(targetValues, new Date(dateFrom), new Date(dateTo));
  issues.forEach((issue) => {
    const value = issue.fields[numberField];

    const date = issue.fields[dateTimeField];
    const term =
      reportType === REPORT_TYPE.WEEKLY
        ? createWeeklyTermKey(new Date(date))
        : createMonthlyTermKey(new Date(date));
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
    .map((key) => store[key]);
};

const issueTypes = (issues, issueType) => {
  const unique = (value, index, array) => array.indexOf(value) === index;
  const ret = issues.map((issue) => issue.fields.issuetype.name).filter(unique);
  return ret == [] ? [issueType] : ret;
};

const assigneeNames = (issues) => {
  const unique = (value, index, array) => array.indexOf(value) === index;
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
      store[key] = { term: term, count: 0, sum: 0, target: targetValue };
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
      store[key] = { term: term, count: 0, sum: 0, target: targetValue };
    });
    dateTo.setDate(dateTo.getDate() - 7);
  }
  return store;
};

export const handler = resolver.getDefinitions();
