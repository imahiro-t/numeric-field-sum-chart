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
  FIELD_NAME_CUSTOM_TARGET_TYPE_FIELD,
  FIELD_NAME_CUSTOM_REPORT_TYPE_FIELD,
  FIELD_NAME_GROUP_LABEL_1,
  FIELD_NAME_GROUP_LABEL_2,
  FIELD_NAME_GROUP_LABEL_3,
  FIELD_NAME_GROUP_LABEL_4,
  FIELD_NAME_GROUP_LABEL_5,
  FIELD_NAME_GROUP_LABEL_6,
  FIELD_NAME_GROUP_LABEL_7,
  FIELD_NAME_GROUP_LABEL_8,
  FIELD_NAME_GROUP_LABEL_9,
  FIELD_NAME_GROUP_LABEL_10,
  FIELD_NAME_GROUP_ISSUE_TYPE_1,
  FIELD_NAME_GROUP_ISSUE_TYPE_2,
  FIELD_NAME_GROUP_ISSUE_TYPE_3,
  FIELD_NAME_GROUP_ISSUE_TYPE_4,
  FIELD_NAME_GROUP_ISSUE_TYPE_5,
  FIELD_NAME_GROUP_ISSUE_TYPE_6,
  FIELD_NAME_GROUP_ISSUE_TYPE_7,
  FIELD_NAME_GROUP_ISSUE_TYPE_8,
  FIELD_NAME_GROUP_ISSUE_TYPE_9,
  FIELD_NAME_GROUP_ISSUE_TYPE_10,
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
  const customTargetTypeField =
    gadgetConfiguration[FIELD_NAME_CUSTOM_TARGET_TYPE_FIELD];
  const customReportTypeField =
    gadgetConfiguration[FIELD_NAME_CUSTOM_REPORT_TYPE_FIELD];
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

  const groupIssueType1 =
    gadgetConfiguration[FIELD_NAME_GROUP_ISSUE_TYPE_1] ?? [];
  const groupIssueType2 =
    gadgetConfiguration[FIELD_NAME_GROUP_ISSUE_TYPE_2] ?? [];
  const groupIssueType3 =
    gadgetConfiguration[FIELD_NAME_GROUP_ISSUE_TYPE_3] ?? [];
  const groupIssueType4 =
    gadgetConfiguration[FIELD_NAME_GROUP_ISSUE_TYPE_4] ?? [];
  const groupIssueType5 =
    gadgetConfiguration[FIELD_NAME_GROUP_ISSUE_TYPE_5] ?? [];
  const groupIssueType6 =
    gadgetConfiguration[FIELD_NAME_GROUP_ISSUE_TYPE_6] ?? [];
  const groupIssueType7 =
    gadgetConfiguration[FIELD_NAME_GROUP_ISSUE_TYPE_7] ?? [];
  const groupIssueType8 =
    gadgetConfiguration[FIELD_NAME_GROUP_ISSUE_TYPE_8] ?? [];
  const groupIssueType9 =
    gadgetConfiguration[FIELD_NAME_GROUP_ISSUE_TYPE_9] ?? [];
  const groupIssueType10 =
    gadgetConfiguration[FIELD_NAME_GROUP_ISSUE_TYPE_10] ?? [];
  const groupLabel1 = gadgetConfiguration[FIELD_NAME_GROUP_LABEL_1] ?? "";
  const groupLabel2 = gadgetConfiguration[FIELD_NAME_GROUP_LABEL_2] ?? "";
  const groupLabel3 = gadgetConfiguration[FIELD_NAME_GROUP_LABEL_3] ?? "";
  const groupLabel4 = gadgetConfiguration[FIELD_NAME_GROUP_LABEL_4] ?? "";
  const groupLabel5 = gadgetConfiguration[FIELD_NAME_GROUP_LABEL_5] ?? "";
  const groupLabel6 = gadgetConfiguration[FIELD_NAME_GROUP_LABEL_6] ?? "";
  const groupLabel7 = gadgetConfiguration[FIELD_NAME_GROUP_LABEL_7] ?? "";
  const groupLabel8 = gadgetConfiguration[FIELD_NAME_GROUP_LABEL_8] ?? "";
  const groupLabel9 = gadgetConfiguration[FIELD_NAME_GROUP_LABEL_9] ?? "";
  const groupLabel10 = gadgetConfiguration[FIELD_NAME_GROUP_LABEL_10] ?? "";

  return context.extension.entryPoint === "edit" ? (
    <Edit
      project={project}
      issueType={issueType}
      numberField={numberField}
      customTargetTypeField={customTargetTypeField}
      customReportTypeField={customReportTypeField}
      dateTimeField={dateTimeField}
      reportMode={reportMode}
      targetType={targetType}
      reportType={reportType}
      termType={termType}
      dateFrom={dateFrom}
      dateTo={dateTo}
      groupIssueType1={groupIssueType1}
      groupIssueType2={groupIssueType2}
      groupIssueType3={groupIssueType3}
      groupIssueType4={groupIssueType4}
      groupIssueType5={groupIssueType5}
      groupIssueType6={groupIssueType6}
      groupIssueType7={groupIssueType7}
      groupIssueType8={groupIssueType8}
      groupIssueType9={groupIssueType9}
      groupIssueType10={groupIssueType10}
      groupLabel1={groupLabel1}
      groupLabel2={groupLabel2}
      groupLabel3={groupLabel3}
      groupLabel4={groupLabel4}
      groupLabel5={groupLabel5}
      groupLabel6={groupLabel6}
      groupLabel7={groupLabel7}
      groupLabel8={groupLabel8}
      groupLabel9={groupLabel9}
      groupLabel10={groupLabel10}
    />
  ) : (
    <View
      project={project}
      issueType={issueType}
      numberField={numberField}
      customTargetTypeField={customTargetTypeField}
      customReportTypeField={customReportTypeField}
      dateTimeField={dateTimeField}
      reportMode={reportMode}
      targetType={targetType}
      reportType={reportType}
      termType={termType}
      dateFrom={dateFrom}
      dateTo={dateTo}
      groupIssueType1={groupIssueType1}
      groupIssueType2={groupIssueType2}
      groupIssueType3={groupIssueType3}
      groupIssueType4={groupIssueType4}
      groupIssueType5={groupIssueType5}
      groupIssueType6={groupIssueType6}
      groupIssueType7={groupIssueType7}
      groupIssueType8={groupIssueType8}
      groupIssueType9={groupIssueType9}
      groupIssueType10={groupIssueType10}
      groupLabel1={groupLabel1}
      groupLabel2={groupLabel2}
      groupLabel3={groupLabel3}
      groupLabel4={groupLabel4}
      groupLabel5={groupLabel5}
      groupLabel6={groupLabel6}
      groupLabel7={groupLabel7}
      groupLabel8={groupLabel8}
      groupLabel9={groupLabel9}
      groupLabel10={groupLabel10}
    />
  );
};

export default App;
