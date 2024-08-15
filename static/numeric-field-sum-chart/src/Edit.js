import React, { useEffect, useState } from "react";
import Form, { Field, FormFooter } from "@atlaskit/form";
import { Box } from "@atlaskit/primitives";
import Select from "@atlaskit/select";
import { RadioGroup } from "@atlaskit/radio";
import { DatePicker } from "@atlaskit/datetime-picker";
import Button, { ButtonGroup } from "@atlaskit/button";
import { view, invoke } from "@forge/bridge";
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

const Edit = (props) => {
  const {
    project,
    issueType,
    numberField,
    dateTimeField,
    reportType,
    termType,
    dateFrom,
    dateTo,
  } = props;
  const [projectResponseJson, setProjectResponseJson] = useState();
  const [issueTypeResponseJson, setIssueTypeResponseJson] = useState();
  const [numberFieldResponseJson, setNumberFieldResponseJson] = useState();
  const [dateTimeFieldResponseJson, setDateTimeFieldResponseJson] = useState();
  const [selectedProject, setSelectedProject] = useState(project);
  const [selectedIssueType, setSelectedIssueType] = useState(issueType);
  const [selectedNumberField, setSelectedNumberField] = useState(numberField);
  const [selectedDateTimeField, setSelectedDateTimeField] =
    useState(dateTimeField);
  const [selectedTermType, setSelectedTermType] = useState(termType);

  useEffect(() => {
    invoke("getRecentProjects", {}).then(setProjectResponseJson);
    if (project) {
      invoke("getProjectIssueTypes", { projectId: project.value }).then(
        setIssueTypeResponseJson
      );
    }
    invoke("getNumberFields", {}).then(setNumberFieldResponseJson);
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
    ? numberFieldResponseJson.map((numericField) => ({
        label: numericField.name,
        value: numericField.id,
      }))
    : [];
  const dateTimeFieldOptions = dateTimeFieldResponseJson
    ? dateTimeFieldResponseJson.map((dateTimeField) => ({
        label: dateTimeField.name,
        value: dateTimeField.id,
      }))
    : [];
  const reportTypeOptions = [
    { name: "reportType", value: REPORT_TYPE.MONTHLY, label: "Monthly" },
    { name: "reportType", value: REPORT_TYPE.WEEKLY, label: "Weekly" },
  ];
  const termTypeOptions = [
    { name: "termType", value: TERM_TYPE.PAST_YEAR, label: "Past Year" },
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

  const handleDateTimeFieldChange = (data) => {
    setSelectedDateTimeField(data);
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
    if (!data[FIELD_NAME_DATE_TIME_FIELD]) {
      data[FIELD_NAME_DATE_TIME_FIELD] = selectedDateTimeField;
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
                  onChange={handleIssueTypeChange}
                />
              )}
            </Field>
            <Field
              name={FIELD_NAME_NUMBER_FIELD}
              label="Target Number Field"
              isRequired
            >
              {({ fieldProps }) => (
                <Select
                  {...fieldProps}
                  defaultValue={numberField}
                  options={numberFieldOptions}
                  onChange={handleNumberFieldChange}
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
                />
              )}
            </Field>
            <Field name={FIELD_NAME_REPORT_TYPE} label="Report Type">
              {({ fieldProps }) => (
                <RadioGroup
                  {...fieldProps}
                  defaultValue={reportType}
                  options={reportTypeOptions}
                />
              )}
            </Field>
          </Box>
          <Box>
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
                    selectedNumberField &&
                    selectedDateTimeField
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
