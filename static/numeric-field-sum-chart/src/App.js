import React, { useEffect, useState } from "react";
import Edit from "./Edit";
import View from "./View";
import { useThemeObserver } from "@atlaskit/tokens";
import { view } from "@forge/bridge";
import {
  REPORT_MODE,
  TARGET_TYPE,
  REPORT_TYPE,
  TERM_TYPE,
  FIELD_NAME_PROJECT,
  FIELD_NAME_ISSUE_TYPE,
  FIELD_NAME_NUMBER_FIELD,
  FIELD_NAME_DATE_TIME_FIELD,
  FIELD_NAME_REPORT_MODE,
  FIELD_NAME_TARGET_TYPE,
  FIELD_NAME_REPORT_TYPE,
  FIELD_NAME_TERM_TYPE,
  FIELD_NAME_DATE_FROM,
  FIELD_NAME_DATE_TO,
} from "./const";
import { formatDate } from "./util";

const App = () => {
  const [context, setContext] = useState();
  const theme = useThemeObserver();
  useEffect(async () => {
    await view.theme.enable();
  }, []);
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
  const reportMode =
    gadgetConfiguration[FIELD_NAME_REPORT_MODE] ?? REPORT_MODE.LINE;
  const targetType =
    gadgetConfiguration[FIELD_NAME_TARGET_TYPE] ?? TARGET_TYPE.ISSUE;
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
      reportMode={reportMode}
      targetType={targetType}
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
      reportMode={reportMode}
      targetType={targetType}
      reportType={reportType}
      termType={termType}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
};

export default App;
