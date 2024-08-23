import Resolver from "@forge/resolver";
import api, { route } from "@forge/api";
import { REPORT_TYPE } from "./const";

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
      )}`
    : `project = ${project} and ${clauseName(
        numberField
      )} >= 0 and ${clauseName(dateTimeField)} >= ${createTermCondition(
        dateFrom
      )} and ${clauseName(dateTimeField)} < ${createTermCondition(
        dateToFroQuery
      )}`;

  var bodyData = `{
    "expand": [
    ],
    "fields": [
      "${numberField}",
      "${dateTimeField}",
      "issuetype"
    ],
    "fieldsByKeys": false,
    "jql": "${jql}",
    "maxResults": 10000,
    "startAt": 0
  }`;

  const response = await api.asUser().requestJira(route`/rest/api/3/search`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: bodyData,
  });

  return createResponseValue(
    await response.json(),
    numberField,
    dateTimeField,
    issueType,
    reportType,
    dateFrom,
    dateTo
  );
});

const createResponseValue = (
  json,
  numberField,
  dateTimeField,
  issueType,
  reportType,
  dateFrom,
  dateTo
) => {
  const store =
    reportType === REPORT_TYPE.WEEKLY
      ? initWeeklyStore(issueTypes(json, issueType), dateFrom, dateTo)
      : initMonthlyStore(issueTypes(json, issueType), dateFrom, dateTo);
  json?.issues?.forEach((issue) => {
    const value = issue.fields[numberField];

    const date = issue.fields[dateTimeField];
    const term =
      reportType === REPORT_TYPE.WEEKLY
        ? createWeeklyTermKey(new Date(date))
        : createMonthlyTermKey(new Date(date));
    const issueType = issue.fields.issuetype.name;
    const key = `${term}-${issueType}`;
    if (store[key]) {
      store[key].count++;
      store[key].sum += value;
    }
  });
  return Object.keys(store)
    .sort()
    .map((key) => store[key]);
};

const issueTypes = (json, issueType) => {
  const unique = (value, index, array) => array.indexOf(value) === index;
  const ret =
    json?.issues?.map((issue) => issue.fields.issuetype.name).filter(unique) ??
    [];
  return ret == [] ? [issueType] : ret;
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

const initMonthlyStore = (issueTypes, dateFrom, dateTo) => {
  const store = {};
  dateFrom.setHours(0, 0, 0, 0);
  dateTo.setHours(0, 0, 0, 0);
  while (dateTo >= dateFrom) {
    const term = createMonthlyTermKey(dateTo);
    issueTypes.forEach((issueType) => {
      const key = `${term}-${issueType}`;
      store[key] = { term: term, count: 0, sum: 0, issueType: issueType };
    });
    dateTo.setMonth(dateTo.getMonth() - 1);
  }
  return store;
};

const initWeeklyStore = (issueTypes, dateFrom, dateTo) => {
  const store = {};
  dateFrom.setHours(0, 0, 0, 0);
  dateTo.setHours(0, 0, 0, 0);
  dateFrom.setDate(dateFrom.getDate() - 6);
  while (dateTo >= dateFrom) {
    const term = createWeeklyTermKey(dateTo);
    issueTypes.forEach((issueType) => {
      const key = `${term}-${issueType}`;
      store[key] = { term: term, count: 0, sum: 0, issueType: issueType };
    });
    dateTo.setDate(dateTo.getDate() - 7);
  }
  return store;
};

export const handler = resolver.getDefinitions();
