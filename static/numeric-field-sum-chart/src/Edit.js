import React, { useEffect, useState } from "react";
import Form, { Field, FormFooter } from "@atlaskit/form";
import { Box } from "@atlaskit/primitives";
import Select from "@atlaskit/select";
import { RadioGroup } from "@atlaskit/radio";
import { DatePicker } from "@atlaskit/datetime-picker";
import Button, { ButtonGroup } from "@atlaskit/button";
import { view, invoke } from "@forge/bridge";
import {
  REPORT_MODE,
  TARGET_TYPE,
  REPORT_TYPE,
  TERM_TYPE,
  FIELD_NAME_PROJECT,
  FIELD_NAME_ISSUE_TYPE,
  FIELD_NAME_NUMBER_FIELD,
  FIELD_NAME_CUSTOM_REPORT_TYPE_FIELD,
  FIELD_NAME_DATE_TIME_FIELD,
  FIELD_NAME_REPORT_MODE,
  FIELD_NAME_TARGET_TYPE,
  FIELD_NAME_REPORT_TYPE,
  FIELD_NAME_TERM_TYPE,
  FIELD_NAME_DATE_FROM,
  FIELD_NAME_DATE_TO,
} from "./const";

const Edit = (props) => {
  const {
    project,
    issueType,
    numberField,
    customReportTypeField,
    dateTimeField,
    reportMode,
    targetType,
    reportType,
    termType,
    dateFrom,
    dateTo,
  } = props;
  const [projectResponseJson, setProjectResponseJson] = useState();
  const [issueTypeResponseJson, setIssueTypeResponseJson] = useState();
  const [numberFieldResponseJson, setNumberFieldResponseJson] = useState();
  const [
    customReportTypeFieldResponseJson,
    setCustomReportTypeFieldResponseJson,
  ] = useState();
  const [dateTimeFieldResponseJson, setDateTimeFieldResponseJson] = useState();
  const [selectedProject, setSelectedProject] = useState(project);
  const [selectedIssueType, setSelectedIssueType] = useState(issueType);
  const [selectedNumberField, setSelectedNumberField] = useState(numberField);
  const [selectedCustomReportTypeField, setSelectedCustomReportTypeField] =
    useState(customReportTypeField);
  const [selectedDateTimeField, setSelectedDateTimeField] =
    useState(dateTimeField);
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

  const handleCustomReportTypeFieldChange = (data) => {
    setSelectedCustomReportTypeField(data);
  };

  const handleDateTimeFieldChange = (data) => {
    setSelectedDateTimeField(data);
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
    if (!data[FIELD_NAME_CUSTOM_REPORT_TYPE_FIELD]) {
      data[FIELD_NAME_CUSTOM_REPORT_TYPE_FIELD] = selectedCustomReportTypeField;
    }
    if (!data[FIELD_NAME_DATE_TIME_FIELD]) {
      data[FIELD_NAME_DATE_TIME_FIELD] = selectedDateTimeField;
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
            <Field name={FIELD_NAME_ISSUE_TYPE} label="Issue Type" isRequired>
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
                  isDisabled={selectedReportMode === REPORT_MODE.CFD}
                />
              )}
            </Field>
          </Box>
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
            <Field name={FIELD_NAME_NUMBER_FIELD} label="Y-Axis" isRequired>
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
            <Field name={FIELD_NAME_DATE_TO} label="To" defaultValue={dateTo}>
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
          <FormFooter>
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
          </FormFooter>
        </form>
      )}
    </Form>
  );
};

export default Edit;
