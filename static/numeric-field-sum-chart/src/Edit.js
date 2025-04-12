import React, { useEffect, useState } from "react";
import Form, { Field } from "@atlaskit/form";
import { Box, Inline, Text } from "@atlaskit/primitives";
import Select from "@atlaskit/select";
import Textfield from "@atlaskit/textfield";
import { RadioGroup } from "@atlaskit/radio";
import { DatePicker } from "@atlaskit/datetime-picker";
import { ButtonGroup } from "@atlaskit/button";
import Button from "@atlaskit/button/new";
import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs";
import { view, invoke } from "@forge/bridge";
import {
  REPORT_MODE,
  TARGET_TYPE,
  REPORT_TYPE,
  TERM_TYPE,
  FIELD_NAME_PROJECT,
  FIELD_NAME_ISSUE_TYPE,
  FIELD_NAME_NUMBER_FIELD,
  FIELD_NAME_CUSTOM_TARGET_TYPE_FIELD,
  FIELD_NAME_CUSTOM_REPORT_TYPE_FIELD,
  FIELD_NAME_DATE_TIME_FIELD,
  FIELD_NAME_REPORT_MODE,
  FIELD_NAME_TARGET_TYPE,
  FIELD_NAME_REPORT_TYPE,
  FIELD_NAME_TERM_TYPE,
  FIELD_NAME_DATE_FROM,
  FIELD_NAME_DATE_TO,
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

const Edit = (props) => {
  const {
    project,
    issueType,
    numberField,
    customTargetTypeField,
    customReportTypeField,
    dateTimeField,
    reportMode,
    targetType,
    reportType,
    termType,
    dateFrom,
    dateTo,
    groupIssueType1,
    groupIssueType2,
    groupIssueType3,
    groupIssueType4,
    groupIssueType5,
    groupIssueType6,
    groupIssueType7,
    groupIssueType8,
    groupIssueType9,
    groupIssueType10,
    groupLabel1,
    groupLabel2,
    groupLabel3,
    groupLabel4,
    groupLabel5,
    groupLabel6,
    groupLabel7,
    groupLabel8,
    groupLabel9,
    groupLabel10,
  } = props;
  const [projectResponseJson, setProjectResponseJson] = useState();
  const [issueTypeResponseJson, setIssueTypeResponseJson] = useState();
  const [numberFieldResponseJson, setNumberFieldResponseJson] = useState();
  const [
    customTargetTypeFieldResponseJson,
    setCustomTargetTypeFieldResponseJson,
  ] = useState();
  const [
    customReportTypeFieldResponseJson,
    setCustomReportTypeFieldResponseJson,
  ] = useState();
  const [dateTimeFieldResponseJson, setDateTimeFieldResponseJson] = useState();
  const [selectedProject, setSelectedProject] = useState(project);
  const [selectedIssueType, setSelectedIssueType] = useState(issueType);
  const [selectedNumberField, setSelectedNumberField] = useState(numberField);
  const [selectedCustomTargetTypeField, setSelectedCustomTargetTypeField] =
    useState(customTargetTypeField);
  const [selectedCustomReportTypeField, setSelectedCustomReportTypeField] =
    useState(customReportTypeField);
  const [selectedDateTimeField, setSelectedDateTimeField] =
    useState(dateTimeField);
  const [selectedTargetType, setSelectedTargetType] = useState(targetType);
  const [selectedReportType, setSelectedReportType] = useState(reportType);
  const [selectedReportMode, setSelectedReportMode] = useState(reportMode);
  const [selectedTermType, setSelectedTermType] = useState(termType);

  useEffect(() => {
    invoke("getRecentProjects", {}).then(setProjectResponseJson);
    if (project) {
      invoke("getProjectIssueTypes", { projectId: project.value }).then(
        setIssueTypeResponseJson
      );
    }
    invoke("getNumberFields", {}).then(setNumberFieldResponseJson);
    invoke("getCustomTargetTypeFields", {}).then(
      setCustomTargetTypeFieldResponseJson
    );
    invoke("getCustomReportTypeFields", {}).then(
      setCustomReportTypeFieldResponseJson
    );
    invoke("getDateTimeFields", {}).then(setDateTimeFieldResponseJson);
  }, []);

  const projectOptions = projectResponseJson
    ? projectResponseJson.map((project) => ({
        label: project.name,
        value: project.id,
      }))
    : [];
  const issueTypeOptions = issueTypeResponseJson
    ? [{ label: "ALL ISSUE TYPES", value: "" }].concat(
        issueTypeResponseJson.map((issueType) => ({
          label: issueType.name,
          value: issueType.name,
        }))
      )
    : [];
  const numberFieldOptions = numberFieldResponseJson
    ? [{ label: "COUNT ONLY", value: "" }].concat(
        numberFieldResponseJson.map((numberField) => ({
          label: numberField.name,
          value: numberField.id,
        }))
      )
    : [];
  const customTargetTypeFieldOptions = customTargetTypeFieldResponseJson
    ? customTargetTypeFieldResponseJson.map((customTargetTypeField) => ({
        label: customTargetTypeField.name,
        value: customTargetTypeField.id,
      }))
    : [];
  const customReportTypeFieldOptions = customReportTypeFieldResponseJson
    ? customReportTypeFieldResponseJson.map((customReportTypeField) => ({
        label: customReportTypeField.name,
        value: customReportTypeField.id,
      }))
    : [];
  const dateTimeFieldOptions = dateTimeFieldResponseJson
    ? dateTimeFieldResponseJson.map((dateTimeField) => ({
        label: dateTimeField.name,
        value: dateTimeField.id,
      }))
    : [];
  const targetTypeOptions = [
    { name: "targetType", value: TARGET_TYPE.ISSUE, label: "Issue" },
    { name: "targetType", value: TARGET_TYPE.ASSIGNEE, label: "Assignee" },
    { name: "targetType", value: TARGET_TYPE.EPIC, label: "Epic" },
    { name: "targetType", value: TARGET_TYPE.CUSTOM, label: "Custom" },
  ];
  const reportTypeOptions = [
    { name: "reportType", value: REPORT_TYPE.MONTHLY, label: "Monthly" },
    { name: "reportType", value: REPORT_TYPE.WEEKLY, label: "Weekly" },
    { name: "reportType", value: REPORT_TYPE.DAILY, label: "Daily" },
    { name: "reportType", value: REPORT_TYPE.SPRINT, label: "Sprint" },
    { name: "reportType", value: REPORT_TYPE.CUSTOM, label: "Custom" },
  ];
  const reportModeOptions = [
    { name: "reportMode", value: REPORT_MODE.LINE, label: "Line Chart" },
    {
      name: "reportMode",
      value: REPORT_MODE.LINE_WITH_BAR,
      label: "Line with Bar Chart",
    },
    { name: "reportMode", value: REPORT_MODE.BAR, label: "Bar Chart" },
    {
      name: "reportMode",
      value: REPORT_MODE.BAR_WITH_LINE,
      label: "Bar with Line Chart",
    },
    {
      name: "reportMode",
      value: REPORT_MODE.STACKED_BAR,
      label: "Stacked Bar Chart",
    },
    {
      name: "reportMode",
      value: REPORT_MODE.STACKED_BAR_WITH_LINE,
      label: "Stacked Bar with Line Chart",
    },
    { name: "reportMode", value: REPORT_MODE.PIE, label: "Pie Chart" },
    {
      name: "reportMode",
      value: REPORT_MODE.DOUGHNUT,
      label: "Doughnut Chart",
    },
    {
      name: "reportMode",
      value: REPORT_MODE.STACKED_RATIO_BAR,
      label: "Stacked Ratio Bar Chart",
    },
    { name: "reportMode", value: REPORT_MODE.TABLE, label: "Table" },
    {
      name: "reportMode",
      value: REPORT_MODE.CFD,
      label: "Cumulative Flow Diagram (CFD)",
    },
  ];
  const termTypeOptions = [
    { name: "termType", value: TERM_TYPE.PAST_YEAR, label: "Past a Year" },
    { name: "termType", value: TERM_TYPE.PAST_1_MONTH, label: "Past a Month" },
    { name: "termType", value: TERM_TYPE.PAST_3_MONTH, label: "Past 3 Months" },
    { name: "termType", value: TERM_TYPE.PAST_6_MONTH, label: "Past 6 Months" },
    { name: "termType", value: TERM_TYPE.DATE_RANGE, label: "Date Range" },
  ];
  const groupIssueTypeOptions = issueTypeResponseJson
    ? issueTypeResponseJson.map((issueType) => ({
        label: issueType.name,
        value: issueType.name,
      }))
    : [];

  const handleProjectChange = (data) => {
    setSelectedProject(data);
    invoke("getProjectIssueTypes", { projectId: data.value }).then(
      setIssueTypeResponseJson
    );
  };

  const handleIssueTypeChange = (data) => {
    setSelectedIssueType(data);
  };

  const handleNumberFieldChange = (data) => {
    setSelectedNumberField(data);
  };

  const handleCustomTargetTypeFieldChange = (data) => {
    setSelectedCustomTargetTypeField(data);
  };

  const handleCustomReportTypeFieldChange = (data) => {
    setSelectedCustomReportTypeField(data);
  };

  const handleDateTimeFieldChange = (data) => {
    setSelectedDateTimeField(data);
  };

  const handleTargetTypeChange = (data) => {
    setSelectedTargetType(data.target.value);
  };

  const handleReportTypeChange = (data) => {
    setSelectedReportType(data.target.value);
  };

  const handleReportModeChange = (data) => {
    setSelectedReportMode(data.target.value);
  };

  const handleTermTypeChange = (data) => {
    setSelectedTermType(data.target.value);
  };

  const handleSave = (data) => {
    if (!data[FIELD_NAME_PROJECT]) {
      data[FIELD_NAME_PROJECT] = selectedProject;
    }
    if (!data[FIELD_NAME_ISSUE_TYPE]) {
      data[FIELD_NAME_ISSUE_TYPE] = selectedIssueType;
    }
    if (!data[FIELD_NAME_NUMBER_FIELD]) {
      data[FIELD_NAME_NUMBER_FIELD] = selectedNumberField;
    }
    if (!data[FIELD_NAME_CUSTOM_TARGET_TYPE_FIELD]) {
      data[FIELD_NAME_CUSTOM_TARGET_TYPE_FIELD] = selectedCustomTargetTypeField;
    }
    if (!data[FIELD_NAME_CUSTOM_REPORT_TYPE_FIELD]) {
      data[FIELD_NAME_CUSTOM_REPORT_TYPE_FIELD] = selectedCustomReportTypeField;
    }
    if (!data[FIELD_NAME_DATE_TIME_FIELD]) {
      data[FIELD_NAME_DATE_TIME_FIELD] = selectedDateTimeField;
    }
    if (!data[FIELD_NAME_TARGET_TYPE]) {
      data[FIELD_NAME_TARGET_TYPE] = selectedTargetType;
    }
    if (!data[FIELD_NAME_REPORT_TYPE]) {
      data[FIELD_NAME_REPORT_TYPE] = selectedReportType;
    }
    if (!data[FIELD_NAME_REPORT_MODE]) {
      data[FIELD_NAME_REPORT_MODE] = selectedReportMode;
    }
    if (!data[FIELD_NAME_TERM_TYPE]) {
      data[FIELD_NAME_TERM_TYPE] = selectedTermType;
    }
    view.submit(data);
  };

  const handleCancel = () => {
    view.close();
  };

  return (
    <Form onSubmit={handleSave}>
      {({ formProps, submitting }) => (
        <form {...formProps}>
          <Inline alignInline="end">
            <ButtonGroup>
              <Button appearance="subtle" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                type="submit"
                isDisabled={
                  submitting ||
                  !(
                    selectedProject &&
                    selectedIssueType &&
                    (selectedReportMode === REPORT_MODE.CFD ||
                      (selectedNumberField && selectedDateTimeField))
                  )
                }
              >
                Save
              </Button>
            </ButtonGroup>
          </Inline>
          <Box>
            <Tabs id="default">
              <TabList>
                <Tab>Target</Tab>
                <Tab>Axis</Tab>
                <Tab>Report</Tab>
                <Tab>Term</Tab>
                <Tab>Issue Group</Tab>
              </TabList>
              <TabPanel>
                <Box>
                  <Field name={FIELD_NAME_PROJECT} label="Project" isRequired>
                    {({ fieldProps }) => (
                      <Select
                        {...fieldProps}
                        defaultValue={project}
                        options={projectOptions}
                        onChange={handleProjectChange}
                      />
                    )}
                  </Field>
                  <Field name={FIELD_NAME_ISSUE_TYPE} isRequired>
                    {({ fieldProps }) => (
                      <Select
                        {...fieldProps}
                        defaultValue={issueType}
                        options={issueTypeOptions}
                        isMulti
                        onChange={handleIssueTypeChange}
                      />
                    )}
                  </Field>
                  <Field name={FIELD_NAME_TARGET_TYPE} label="Target Type">
                    {({ fieldProps }) => (
                      <RadioGroup
                        {...fieldProps}
                        defaultValue={targetType}
                        options={targetTypeOptions}
                        onChange={handleTargetTypeChange}
                        isDisabled={selectedReportMode === REPORT_MODE.CFD}
                      />
                    )}
                  </Field>
                  <Field
                    name={FIELD_NAME_CUSTOM_TARGET_TYPE_FIELD}
                    label="Target Type Custom Field"
                  >
                    {({ fieldProps }) => (
                      <Select
                        {...fieldProps}
                        defaultValue={customTargetTypeField}
                        options={customTargetTypeFieldOptions}
                        onChange={handleCustomTargetTypeFieldChange}
                        isDisabled={
                          selectedTargetType !== TARGET_TYPE.CUSTOM ||
                          selectedReportMode === REPORT_MODE.CFD
                        }
                      />
                    )}
                  </Field>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box>
                  <Field name={FIELD_NAME_REPORT_TYPE} label="X-Axis">
                    {({ fieldProps }) => (
                      <RadioGroup
                        {...fieldProps}
                        defaultValue={reportType}
                        options={reportTypeOptions}
                        onChange={handleReportTypeChange}
                      />
                    )}
                  </Field>
                  <Field
                    name={FIELD_NAME_CUSTOM_REPORT_TYPE_FIELD}
                    label="X-Axis Custom Field"
                  >
                    {({ fieldProps }) => (
                      <Select
                        {...fieldProps}
                        defaultValue={customReportTypeField}
                        options={customReportTypeFieldOptions}
                        onChange={handleCustomReportTypeFieldChange}
                        isDisabled={
                          selectedReportType !== REPORT_TYPE.CUSTOM ||
                          selectedReportMode === REPORT_MODE.CFD
                        }
                      />
                    )}
                  </Field>
                  <Field
                    name={FIELD_NAME_NUMBER_FIELD}
                    label="Y-Axis"
                    isRequired
                  >
                    {({ fieldProps }) => (
                      <Select
                        {...fieldProps}
                        defaultValue={numberField}
                        options={numberFieldOptions}
                        onChange={handleNumberFieldChange}
                        isDisabled={selectedReportMode === REPORT_MODE.CFD}
                      />
                    )}
                  </Field>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box>
                  <Field name={FIELD_NAME_REPORT_MODE} label="Report Mode">
                    {({ fieldProps }) => (
                      <RadioGroup
                        {...fieldProps}
                        defaultValue={reportMode}
                        options={reportModeOptions}
                        onChange={handleReportModeChange}
                      />
                    )}
                  </Field>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box>
                  <Field
                    name={FIELD_NAME_DATE_TIME_FIELD}
                    label="Target Date Field"
                    isRequired
                  >
                    {({ fieldProps }) => (
                      <Select
                        {...fieldProps}
                        defaultValue={dateTimeField}
                        options={dateTimeFieldOptions}
                        onChange={handleDateTimeFieldChange}
                        isDisabled={selectedReportMode === REPORT_MODE.CFD}
                      />
                    )}
                  </Field>{" "}
                  <Field name={FIELD_NAME_TERM_TYPE} label="Term Type">
                    {({ fieldProps }) => (
                      <RadioGroup
                        {...fieldProps}
                        defaultValue={termType}
                        options={termTypeOptions}
                        onChange={handleTermTypeChange}
                      />
                    )}
                  </Field>
                  <Field
                    name={FIELD_NAME_DATE_FROM}
                    label="From"
                    defaultValue={dateFrom}
                  >
                    {({ fieldProps }) => (
                      <DatePicker
                        {...fieldProps}
                        weekStartDay={1}
                        dateFormat="YYYY-MM-DD"
                        isDisabled={selectedTermType !== TERM_TYPE.DATE_RANGE}
                      />
                    )}
                  </Field>
                  <Field
                    name={FIELD_NAME_DATE_TO}
                    label="To"
                    defaultValue={dateTo}
                  >
                    {({ fieldProps }) => (
                      <DatePicker
                        {...fieldProps}
                        weekStartDay={1}
                        dateFormat="YYYY-MM-DD"
                        isDisabled={selectedTermType !== TERM_TYPE.DATE_RANGE}
                      />
                    )}
                  </Field>
                </Box>
              </TabPanel>
              <TabPanel>
                <Box>
                  <Inline>
                    <Field name={FIELD_NAME_GROUP_LABEL_1}>
                      {({ fieldProps }) => (
                        <Textfield {...fieldProps} defaultValue={groupLabel1} />
                      )}
                    </Field>{" "}
                    <Field name={FIELD_NAME_GROUP_ISSUE_TYPE_1}>
                      {({ fieldProps }) => (
                        <Select
                          {...fieldProps}
                          defaultValue={groupIssueType1}
                          options={groupIssueTypeOptions}
                          isMulti
                        />
                      )}
                    </Field>{" "}
                  </Inline>
                  <Inline>
                    <Field name={FIELD_NAME_GROUP_LABEL_2}>
                      {({ fieldProps }) => (
                        <Textfield {...fieldProps} defaultValue={groupLabel2} />
                      )}
                    </Field>{" "}
                    <Field name={FIELD_NAME_GROUP_ISSUE_TYPE_2}>
                      {({ fieldProps }) => (
                        <Select
                          {...fieldProps}
                          defaultValue={groupIssueType2}
                          options={groupIssueTypeOptions}
                          isMulti
                        />
                      )}
                    </Field>{" "}
                  </Inline>
                  <Inline>
                    <Field name={FIELD_NAME_GROUP_LABEL_3}>
                      {({ fieldProps }) => (
                        <Textfield {...fieldProps} defaultValue={groupLabel3} />
                      )}
                    </Field>{" "}
                    <Field name={FIELD_NAME_GROUP_ISSUE_TYPE_3}>
                      {({ fieldProps }) => (
                        <Select
                          {...fieldProps}
                          defaultValue={groupIssueType3}
                          options={groupIssueTypeOptions}
                          isMulti
                        />
                      )}
                    </Field>{" "}
                  </Inline>
                  <Inline>
                    <Field name={FIELD_NAME_GROUP_LABEL_4}>
                      {({ fieldProps }) => (
                        <Textfield {...fieldProps} defaultValue={groupLabel4} />
                      )}
                    </Field>{" "}
                    <Field name={FIELD_NAME_GROUP_ISSUE_TYPE_4}>
                      {({ fieldProps }) => (
                        <Select
                          {...fieldProps}
                          defaultValue={groupIssueType4}
                          options={groupIssueTypeOptions}
                          isMulti
                        />
                      )}
                    </Field>{" "}
                  </Inline>
                  <Inline>
                    <Field name={FIELD_NAME_GROUP_LABEL_5}>
                      {({ fieldProps }) => (
                        <Textfield {...fieldProps} defaultValue={groupLabel5} />
                      )}
                    </Field>{" "}
                    <Field name={FIELD_NAME_GROUP_ISSUE_TYPE_5}>
                      {({ fieldProps }) => (
                        <Select
                          {...fieldProps}
                          defaultValue={groupIssueType5}
                          options={groupIssueTypeOptions}
                          isMulti
                        />
                      )}
                    </Field>{" "}
                  </Inline>
                  <Inline>
                    <Field name={FIELD_NAME_GROUP_LABEL_6}>
                      {({ fieldProps }) => (
                        <Textfield {...fieldProps} defaultValue={groupLabel6} />
                      )}
                    </Field>{" "}
                    <Field name={FIELD_NAME_GROUP_ISSUE_TYPE_6}>
                      {({ fieldProps }) => (
                        <Select
                          {...fieldProps}
                          defaultValue={groupIssueType6}
                          options={groupIssueTypeOptions}
                          isMulti
                        />
                      )}
                    </Field>{" "}
                  </Inline>
                  <Inline>
                    <Field name={FIELD_NAME_GROUP_LABEL_7}>
                      {({ fieldProps }) => (
                        <Textfield {...fieldProps} defaultValue={groupLabel7} />
                      )}
                    </Field>{" "}
                    <Field name={FIELD_NAME_GROUP_ISSUE_TYPE_7}>
                      {({ fieldProps }) => (
                        <Select
                          {...fieldProps}
                          defaultValue={groupIssueType7}
                          options={groupIssueTypeOptions}
                          isMulti
                        />
                      )}
                    </Field>{" "}
                  </Inline>
                  <Inline>
                    <Field name={FIELD_NAME_GROUP_LABEL_8}>
                      {({ fieldProps }) => (
                        <Textfield {...fieldProps} defaultValue={groupLabel8} />
                      )}
                    </Field>{" "}
                    <Field name={FIELD_NAME_GROUP_ISSUE_TYPE_8}>
                      {({ fieldProps }) => (
                        <Select
                          {...fieldProps}
                          defaultValue={groupIssueType8}
                          options={groupIssueTypeOptions}
                          isMulti
                        />
                      )}
                    </Field>{" "}
                  </Inline>
                  <Inline>
                    <Field name={FIELD_NAME_GROUP_LABEL_9}>
                      {({ fieldProps }) => (
                        <Textfield {...fieldProps} defaultValue={groupLabel9} />
                      )}
                    </Field>{" "}
                    <Field name={FIELD_NAME_GROUP_ISSUE_TYPE_9}>
                      {({ fieldProps }) => (
                        <Select
                          {...fieldProps}
                          defaultValue={groupIssueType9}
                          options={groupIssueTypeOptions}
                          isMulti
                        />
                      )}
                    </Field>{" "}
                  </Inline>
                  <Inline>
                    <Field name={FIELD_NAME_GROUP_LABEL_10}>
                      {({ fieldProps }) => (
                        <Textfield
                          {...fieldProps}
                          defaultValue={groupLabel10}
                        />
                      )}
                    </Field>{" "}
                    <Field name={FIELD_NAME_GROUP_ISSUE_TYPE_10}>
                      {({ fieldProps }) => (
                        <Select
                          {...fieldProps}
                          defaultValue={groupIssueType10}
                          options={groupIssueTypeOptions}
                          isMulti
                        />
                      )}
                    </Field>{" "}
                  </Inline>
                </Box>
              </TabPanel>
            </Tabs>
          </Box>
          <Box padding="space.1000"></Box>
        </form>
      )}
    </Form>
  );
};

export default Edit;
