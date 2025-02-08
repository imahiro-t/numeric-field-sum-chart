import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import { Box } from "@atlaskit/primitives";
import DynamicTable from "@atlaskit/dynamic-table";
import { REPORT_MODE, TERM_TYPE } from "./const";
import { formatDate } from "./util";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  BarElement,
  ArcElement,
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
    reportMode,
    targetType,
    reportType,
    termType,
    dateFrom,
    dateTo,
  } = props;

  const currentDate = new Date();
  const oneYearAgo = new Date();
  const oneMonthAgo = new Date();
  const threeMonthAgo = new Date();
  const sixMonthAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  if (oneMonthAgo.getMonth() < 1) {
    oneMonthAgo.setFullYear(oneMonthAgo.getFullYear() - 1);
    oneMonthAgo.setMonth(12 + oneMonthAgo.getMonth() - 1);
  } else {
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  }
  if (threeMonthAgo.getMonth() < 3) {
    threeMonthAgo.setFullYear(threeMonthAgo.getFullYear() - 1);
    threeMonthAgo.setMonth(12 + threeMonthAgo.getMonth() - 3);
  } else {
    threeMonthAgo.setMonth(threeMonthAgo.getMonth() - 3);
  }
  if (sixMonthAgo.getMonth() < 6) {
    sixMonthAgo.setFullYear(sixMonthAgo.getFullYear() - 1);
    sixMonthAgo.setMonth(12 + sixMonthAgo.getMonth() - 6);
  } else {
    sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
  }

  useEffect(() => {
    if (project && issueType && numberField && dateTimeField) {
      invoke("searchIssues", {
        project: project.value,
        issueType: Array.isArray(issueType)
          ? issueType.filter((x) => x.value.length > 0).map((x) => x.value)
          : [issueType.value],
        numberField: numberField.value,
        dateTimeField: dateTimeField.value,
        targetType: targetType,
        reportType: reportType,
        dateFromStr:
          termType === TERM_TYPE.PAST_YEAR
            ? formatDate(oneYearAgo)
            : termType === TERM_TYPE.PAST_1_MONTH
            ? formatDate(oneMonthAgo)
            : termType === TERM_TYPE.PAST_3_MONTH
            ? formatDate(threeMonthAgo)
            : termType === TERM_TYPE.PAST_6_MONTH
            ? formatDate(sixMonthAgo)
            : dateFrom,
        dateToStr:
          termType === TERM_TYPE.PAST_YEAR
            ? formatDate(currentDate)
            : termType === TERM_TYPE.PAST_1_MONTH
            ? formatDate(currentDate)
            : termType === TERM_TYPE.PAST_3_MONTH
            ? formatDate(currentDate)
            : termType === TERM_TYPE.PAST_6_MONTH
            ? formatDate(currentDate)
            : dateTo,
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

  const sumColors = [
    "rgba(255, 99, 132, 0.6)", // Red
    "rgba(53, 162, 235, 0.6)", // Blue
    "rgba(75, 192, 192, 0.6)", // Green
    "rgba(255, 206, 86, 0.6)", // Yellow
    "rgba(153, 102, 255, 0.6)", // Purple
    "rgba(255, 159, 64, 0.6)", // Orange
    "rgba(201, 203, 207, 0.6)", // Gray
  ];

  const countColors = [
    "rgba(255, 99, 132, 0.3)", // Red
    "rgba(53, 162, 235, 0.3)", // Blue
    "rgba(75, 192, 192, 0.3)", // Green
    "rgba(255, 206, 86, 0.3)", // Yellow
    "rgba(153, 102, 255, 0.3)", // Purple
    "rgba(255, 159, 64, 0.3)", // Orange
    "rgba(201, 203, 207, 0.3)", // Gray
  ];

  const createDataForSumWithCount = (values, secondType) => {
    const labels = createLabels(values);
    const valueMap = values.reduce(
      (acc, value) => createMap(value.target, value.sum, acc),
      {}
    );
    const datasets = Object.keys(valueMap).map((target, index) => ({
      label: target,
      yAxisID: "y",
      data: valueMap[target],
      borderColor: sumColors[index % 7],
      backgroundColor: sumColors[index % 7],
    }));

    const valueMap2 = values.reduce(
      (acc, value) => createMap(value.target, value.count, acc),
      {}
    );
    const datasets2 = Object.keys(valueMap2).map((target, index) => ({
      type: secondType,
      label: target,
      yAxisID: "y1",
      data: valueMap2[target],
      borderColor: countColors[index % 7],
      backgroundColor: countColors[index % 7],
    }));

    return {
      labels: labels,
      datasets: datasets.concat(datasets2),
    };
  };

  const createDataForSum = (values) => {
    const labels = createLabels(values);
    const valueMap = values.reduce(
      (acc, value) => createMap(value.target, value.sum, acc),
      {}
    );
    const datasets = Object.keys(valueMap).map((target, index) => ({
      label: target,
      data: valueMap[target],
      borderColor: sumColors[index % 7],
      backgroundColor: sumColors[index % 7],
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
      borderColor: countColors[index % 7],
      backgroundColor: countColors[index % 7],
    }));
    return {
      labels: labels,
      datasets: datasets,
    };
  };

  const createDataForPieSum = (values) => {
    const term =
      values.length > 0 ? values.sort((a, b) => b.order - a.order)[0].term : "";
    const labels = values
      .filter((value) => value.term === term)
      .map((value) => value.target);
    const datasets = values
      .filter((value) => value.term === term)
      .map((value) => value.sum);
    return {
      labels: labels,
      datasets: [
        {
          data: datasets,
          borderColor: sumColors,
          backgroundColor: sumColors,
        },
      ],
    };
  };

  const createDataForPieCount = (values) => {
    const term =
      values.length > 0 ? values.sort((a, b) => b.order - a.order)[0].term : "";
    const labels = values
      .filter((value) => value.term === term)
      .map((value) => value.target);
    const datasets = values
      .filter((value) => value.term === term)
      .map((value) => value.count);
    return {
      labels: labels,
      datasets: [
        {
          data: datasets,
          borderColor: countColors,
          backgroundColor: countColors,
        },
      ],
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
      {reportMode === REPORT_MODE.PIE && (
        <>
          <Box>
            <Pie
              options={{
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
              data={createDataForPieSum(issueResponseJson)}
            />
            <Pie
              options={{
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
              data={createDataForPieCount(issueResponseJson)}
            />
          </Box>
        </>
      )}
      {reportMode === REPORT_MODE.DOUGHNUT && (
        <>
          <Box>
            <Doughnut
              options={{
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
              data={createDataForPieSum(issueResponseJson)}
            />
            <Doughnut
              options={{
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
              data={createDataForPieCount(issueResponseJson)}
            />
          </Box>
        </>
      )}
      {reportMode === REPORT_MODE.BAR && (
        <>
          <Box>
            <Bar
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
            <Bar
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
        </>
      )}
      {reportMode === REPORT_MODE.BAR_WITH_LINE && (
        <>
          <Box>
            <Bar
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
                scales: {
                  y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    ticks: {
                      color: "rgba(0, 0, 0, 1)",
                    },
                    grid: {
                      drawBorder: true,
                      drawTicks: true,
                      color: "rgba(0, 0, 0, 0.2)",
                    },
                  },
                  y1: {
                    type: "linear",
                    display: true,
                    position: "right",
                    title: {
                      display: true,
                      text: "Count of issues",
                      font: {
                        size: 12,
                      },
                    },
                  },
                },
              }}
              data={createDataForSumWithCount(issueResponseJson, "line")}
            />
          </Box>
        </>
      )}
      {reportMode === REPORT_MODE.STACKED_BAR && (
        <>
          <Box>
            <Bar
              options={{
                responsive: true,
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
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
            <Bar
              options={{
                responsive: true,
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
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
        </>
      )}
      {reportMode === REPORT_MODE.STACKED_BAR_WITH_LINE && (
        <>
          <Box>
            <Bar
              options={{
                responsive: true,
                x: {
                  stacked: true,
                },
                y: {
                  stacked: true,
                },
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                  title: {
                    display: true,
                    text: `Sum of ${numberField.label}`,
                  },
                },
                scales: {
                  y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    ticks: {
                      color: "rgba(0, 0, 0, 1)",
                    },
                    grid: {
                      drawBorder: true,
                      drawTicks: true,
                      color: "rgba(0, 0, 0, 0.2)",
                    },
                  },
                  y1: {
                    type: "linear",
                    display: true,
                    position: "right",
                    title: {
                      display: true,
                      text: "Count of issues",
                      font: {
                        size: 12,
                      },
                    },
                  },
                },
              }}
              data={createDataForSumWithCount(issueResponseJson, "line")}
            />
          </Box>
        </>
      )}
      {reportMode === REPORT_MODE.LINE && (
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
        </>
      )}
      {reportMode === REPORT_MODE.LINE_WITH_BAR && (
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
                scales: {
                  y: {
                    type: "linear",
                    display: true,
                    position: "left",
                    ticks: {
                      color: "rgba(0, 0, 0, 1)",
                    },
                    grid: {
                      drawBorder: true,
                      drawTicks: true,
                      color: "rgba(0, 0, 0, 0.2)",
                    },
                  },
                  y1: {
                    type: "linear",
                    display: true,
                    position: "right",
                    title: {
                      display: true,
                      text: "Count of issues",
                      font: {
                        size: 12,
                      },
                    },
                  },
                },
              }}
              data={createDataForSumWithCount(issueResponseJson, "bar")}
            />
          </Box>
        </>
      )}
      {reportMode === REPORT_MODE.TABLE && (
        <>
          <Box>
            <DynamicTable
              caption={`List of ${numberField.label}`}
              head={head}
              rows={createRows(issueResponseJson)}
              rowsPerPage={30}
            />
          </Box>
        </>
      )}
    </>
  ) : (
    <></>
  );
};

export default View;
