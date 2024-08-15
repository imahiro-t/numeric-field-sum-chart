import React, { useEffect, useState } from "react";
import Edit from "./Edit";
import View from "./View";
import { view } from "@forge/bridge";
import {
  REPORT_TYPE,
  TERM_TYPE,
  FIELD_NAME_PROJECT,
  FIELD_NAME_ISSUE_TYPE,
  FIELD_NAME_NUMBER_FIELD,
  FIELD_NAME_DATE_TIME_FIELD,
  FIELD_NAME_REPORT_TYPE,
  FIELD_NAME_TERM_TYPE,
  FIELD_NAME_DATE_FROM,
  FIELD_NAME_DATE_TO,
} from "./const";
import { formatDate } from "./util";

const App = () => {
  const [context, setContext] = useState();

  useEffect(() => {
    view.getContext().then(setContext);
  }, []);

  if (!context) {
    return "Loading...";
  }
  const {
    extension: { gadgetConfiguration },
  } = context;

  const createFromDefaultValue = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return formatDate(date);
  };

  const createToDefaultValue = () => {
    const date = new Date();
    return formatDate(date);
  };

  const project = gadgetConfiguration[FIELD_NAME_PROJECT];
  const issueType = gadgetConfiguration[FIELD_NAME_ISSUE_TYPE];
  const numberField = gadgetConfiguration[FIELD_NAME_NUMBER_FIELD];
  const dateTimeField = gadgetConfiguration[FIELD_NAME_DATE_TIME_FIELD];
  const reportType =
    gadgetConfiguration[FIELD_NAME_REPORT_TYPE] ?? REPORT_TYPE.MONTHLY;
  const termType =
    gadgetConfiguration[FIELD_NAME_TERM_TYPE] ?? TERM_TYPE.PAST_YEAR;
  const dateFrom =
    gadgetConfiguration[FIELD_NAME_DATE_FROM] ?? createFromDefaultValue();
  const dateTo =
    gadgetConfiguration[FIELD_NAME_DATE_TO] ?? createToDefaultValue();

  return context.extension.entryPoint === "edit" ? (
    <Edit
      project={project}
      issueType={issueType}
      numberField={numberField}
      dateTimeField={dateTimeField}
      reportType={reportType}
      termType={termType}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  ) : (
    <View
      project={project}
      issueType={issueType}
      numberField={numberField}
      dateTimeField={dateTimeField}
      reportType={reportType}
      termType={termType}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
};

export default App;
