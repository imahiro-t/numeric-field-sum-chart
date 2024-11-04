import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import { Box } from "@atlaskit/primitives";
import DynamicTable from "@atlaskit/dynamic-table";
import { TERM_TYPE } from "./const";
import { formatDate } from "./util";
import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

Chart.register(
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  RadialLinearScale,
  Filler
);

const View = (props) => {
  const [issueResponseJson, setIssueResponseJson] = useState();
  const {
    project,
    issueType,
    numberField,
    dateTimeField,
    targetType,
    reportType,
    termType,
    dateFrom,
    dateTo,
  } = props;

  const currentDate = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  useEffect(() => {
    if (project && issueType && numberField && dateTimeField) {
      invoke("searchIssues", {
        project: project.value,
        issueType: issueType.value,
        numberField: numberField.value,
        dateTimeField: dateTimeField.value,
        targetType: targetType,
        reportType: reportType,
        dateFromStr:
          termType === TERM_TYPE.PAST_YEAR ? formatDate(oneYearAgo) : dateFrom,
        dateToStr:
          termType === TERM_TYPE.PAST_YEAR ? formatDate(currentDate) : dateTo,
      }).then(setIssueResponseJson);
    }
  }, []);

  const createMap = (target, value, map) => {
    if (!map[target]) {
      map[target] = [];
    }
    map[target].push(value);
    return map;
  };

  const createLabels = (values) => {
    const labelMap = values.reduce(
      (acc, value) => createMap(value.target, value.term, acc),
      {}
    );
    return Object.keys(labelMap).length > 0
      ? labelMap[Object.keys(labelMap).at(0)]
      : [];
  };

  const backgroundColors = [
    "rgba(255, 99, 132, 0.5)", // Red
    "rgba(53, 162, 235, 0.5)", // Blue
    "rgba(75, 192, 192, 0.5)", // Green
    "rgba(255, 206, 86, 0.5)", // Yellow
    "rgba(153, 102, 255, 0.5)", // Purple
    "rgba(255, 159, 64, 0.5)", // Orange
    "rgba(201, 203, 207, 0.5)", // Gray
  ];

  const createDataForSum = (values) => {
    const labels = createLabels(values);
    const valueMap = values.reduce(
      (acc, value) => createMap(value.target, value.sum, acc),
      {}
    );
    const datasets = Object.keys(valueMap).map((target, index) => ({
      label: target,
      data: valueMap[target],
      borderColor: backgroundColors[index % 7],
      backgroundColor: backgroundColors[index % 7],
    }));
    return {
      labels: labels,
      datasets: datasets,
    };
  };

  const createDataForCount = (values) => {
    const labels = createLabels(values);
    const valueMap = values.reduce(
      (acc, value) => createMap(value.target, value.count, acc),
      {}
    );
    const datasets = Object.keys(valueMap).map((target, index) => ({
      label: target,
      data: valueMap[target],
      borderColor: backgroundColors[index % 7],
      backgroundColor: backgroundColors[index % 7],
    }));
    return {
      labels: labels,
      datasets: datasets,
    };
  };

  const createKey = (input) => {
    return input ? input.replace(/^(the|a|an)/, "").replace(/\s/g, "") : input;
  };

  const createRows = (values) => {
    return values.reverse().map((value, index) => ({
      key: `row-${index}-${value.term}`,
      cells: [
        {
          key: value.term,
          content: value.term,
        },
        {
          key: createKey(value.target),
          content: value.target,
        },
        {
          key: value.count,
          content: value.count,
        },
        {
          key: value.sum,
          content: value.sum,
        },
      ],
    }));
  };

  const head = {
    cells: [
      {
        key: "term",
        content: "Term",
        isSortable: true,
      },
      {
        key: "target",
        content: "Target",
        shouldTruncate: true,
        isSortable: true,
      },
      {
        key: "count",
        content: "Issue Count",
        isSortable: true,
      },
      {
        key: "sum",
        content: "Sum",
        isSortable: true,
      },
    ],
  };

  return issueResponseJson ? (
    <>
      <Box>
        <Line
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "bottom",
              },
              title: {
                display: true,
                text: `Sum of ${numberField.label}`,
              },
            },
          }}
          data={createDataForSum(issueResponseJson)}
        />
      </Box>
      <Box padding="space.100" />
      <Box>
        <Line
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: "bottom",
              },
              title: {
                display: true,
                text: `Count of issues with ${numberField.label}`,
              },
            },
          }}
          data={createDataForCount(issueResponseJson)}
        />
      </Box>
      <Box padding="space.100" />
      <Box>
        <DynamicTable
          caption={`List of ${numberField.label}`}
          head={head}
          rows={createRows(issueResponseJson)}
          rowsPerPage={20}
        />
      </Box>
    </>
  ) : (
    <></>
  );
};

export default View;
