import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import { Box } from "@atlaskit/primitives";
import DynamicTable from "@atlaskit/dynamic-table";
import { REPORT_MODE, REPORT_TYPE, TARGET_TYPE, TERM_TYPE } from "./const";
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
    customTargetTypeField,
    customReportTypeField,
    dateTimeField,
    reportMode,
    targetType,
    reportType,
    termType,
    dateFrom,
    dateTo,
  } = props;

  const reportTypeLabel =
    reportType === REPORT_TYPE.SPRINT
      ? "Sprint"
      : reportType === REPORT_TYPE.CUSTOM
      ? customReportTypeField?.label ?? ""
      : "Term";
  const targetTypeLabel =
    targetType === TARGET_TYPE.ISSUE
      ? "Issues"
      : targetType === TARGET_TYPE.ASSIGNEE
      ? "Assignees"
      : targetType === TARGET_TYPE.CUSTOM
      ? customTargetTypeField?.label ?? ""
      : "Epics";

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
    if (
      project &&
      issueType &&
      (reportMode === REPORT_MODE.CFD || (numberField && dateTimeField))
    ) {
      invoke("searchIssues", {
        project: project.value,
        issueType: Array.isArray(issueType)
          ? issueType.filter((x) => x.value.length > 0).map((x) => x.value)
          : [issueType.value],
        numberField: numberField?.value ?? "",
        customTargetTypeField: customTargetTypeField?.value,
        customReportTypeField: customReportTypeField?.value,
        dateTimeField: dateTimeField?.value,
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
        isCumulative: reportMode === REPORT_MODE.CFD,
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
    "rgba(179, 157, 219, 0.6)", // Light Purple (薄紫)
    "rgba(174, 213, 129, 0.6)", // Light Green (黄緑)
    "rgba(144, 202, 249, 0.6)", // Light Blue (水色)
    "rgba(248, 187, 208, 0.6)", // Light Pink (ピンク)
    "rgba(161, 136, 127, 0.6)", // Brown (茶色)
    "rgba(238, 224, 204, 0.6)", // Beige (黄土色)
    "rgba(38, 70, 83, 0.6)", // Dark Green (深緑)
  ];

  const countColors = [
    "rgba(255, 99, 132, 0.3)", // Red
    "rgba(53, 162, 235, 0.3)", // Blue
    "rgba(75, 192, 192, 0.3)", // Green
    "rgba(255, 206, 86, 0.3)", // Yellow
    "rgba(153, 102, 255, 0.3)", // Purple
    "rgba(255, 159, 64, 0.3)", // Orange
    "rgba(201, 203, 207, 0.3)", // Gray
    "rgba(179, 157, 219, 0.3)", // Light Purple (薄紫)
    "rgba(174, 213, 129, 0.3)", // Light Green (黄緑)
    "rgba(144, 202, 249, 0.3)", // Light Blue (水色)
    "rgba(248, 187, 208, 0.3)", // Light Pink (ピンク)
    "rgba(161, 136, 127, 0.3)", // Brown (茶色)
    "rgba(238, 224, 204, 0.3)", // Beige (黄土色)
    "rgba(38, 70, 83, 0.3)", // Dark Green (深緑)
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
      borderColor: sumColors[index % sumColors.length],
      backgroundColor: sumColors[index % sumColors.length],
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
      borderColor: countColors[index % countColors.length],
      backgroundColor: countColors[index % countColors.length],
    }));

    return {
      labels: labels,
      datasets: datasets.concat(datasets2),
    };
  };

  const createDataForSum = (values, isRatio = false) => {
    const labels = createLabels(values);
    const valueMap = values.reduce(
      (acc, value) => createMap(value.target, value.sum, acc),
      {}
    );
    const datasets = Object.keys(valueMap).map((target, index) => ({
      label: target,
      data: valueMap[target],
      borderColor: sumColors[index % sumColors.length],
      backgroundColor: sumColors[index % sumColors.length],
    }));
    return {
      labels: labels,
      datasets: isRatio ? transformToRatio(datasets) : datasets,
    };
  };

  const createDataForCount = (values, isRatio = false) => {
    const labels = createLabels(values);
    const valueMap = values.reduce(
      (acc, value) => createMap(value.target, value.count, acc),
      {}
    );
    const datasets = Object.keys(valueMap).map((target, index) => ({
      label: target,
      data: valueMap[target],
      borderColor: countColors[index % countColors.length],
      backgroundColor: countColors[index % countColors.length],
    }));
    return {
      labels: labels,
      datasets: isRatio ? transformToRatio(datasets) : datasets,
    };
  };

  const transformToRatio = (datasets) => {
    let sums = [];
    const datasets2 = structuredClone(datasets);
    datasets2.forEach((dataset, index) => {
      if (index === 0) {
        sums = Array.from(dataset.data);
      } else {
        dataset.data.forEach((_data, index2) => {
          sums[index2] = sums[index2] + dataset.data[index2];
        });
      }
    });
    datasets2.forEach((dataset) => {
      dataset.data.forEach((_data, index2) => {
        dataset.data[index2] = (dataset.data[index2] * 100) / sums[index2];
      });
    });
    return datasets2;
  };

  const createDataForCFD = (values) => {
    const labels = createLabels(values);
    const valueMap = values.reduce(
      (acc, value) => createMap(value.target, value.count, acc),
      {}
    );
    const datasets = ["DONE", "TODO / DOING"].map((target, index) => ({
      label: target,
      data: valueMap[target],
      borderColor: countColors[index % countColors.length],
      backgroundColor: countColors[index % countColors.length],
      fill: index === 0 ? "origin" : "-1",
    }));
    return {
      labels: labels,
      datasets: datasets,
    };
  };

  const createDataForPieSum = (values) => {
    const mergedValuesMap = {};
    values.forEach((value) => {
      mergedValuesMap[value.target] = {
        target: value.target,
        count: value.count + (mergedValuesMap[value.target]?.count ?? 0),
        sum: value.sum + (mergedValuesMap[value.target]?.sum ?? 0),
      };
    });
    const mergedValues = Object.keys(mergedValuesMap).map(
      (key) => mergedValuesMap[key]
    );
    const labels = mergedValues.map((value) => value.target);
    const datasets = mergedValues.map((value) => value.sum);
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
    const mergedValuesMap = {};
    values.forEach((value) => {
      mergedValuesMap[value.target] = {
        target: value.target,
        count: value.count + (mergedValuesMap[value.target]?.count ?? 0),
        sum: value.sum + (mergedValuesMap[value.target]?.sum ?? 0),
      };
    });
    const mergedValues = Object.keys(mergedValuesMap).map(
      (key) => mergedValuesMap[key]
    );
    const labels = mergedValues.map((value) => value.target);
    const datasets = mergedValues.map((value) => value.count);
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
        content: reportTypeLabel,
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
        content: "Count",
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
                    text:
                      (numberField?.value ?? "").length > 0
                        ? `Sum of ${numberField.label}`
                        : `Count of ${targetTypeLabel}`,
                  },
                },
              }}
              data={createDataForPieSum(issueResponseJson)}
            />
            {(numberField?.value ?? "").length > 0 && (
              <Pie
                options={{
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                    title: {
                      display: true,
                      text: `Count of ${targetTypeLabel} with ${numberField.label}`,
                    },
                  },
                }}
                data={createDataForPieCount(issueResponseJson)}
              />
            )}
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
                    text:
                      (numberField?.value ?? "").length > 0
                        ? `Sum of ${numberField.label}`
                        : `Count of ${targetTypeLabel}`,
                  },
                },
              }}
              data={createDataForPieSum(issueResponseJson)}
            />
            {(numberField?.value ?? "").length > 0 && (
              <Doughnut
                options={{
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                    title: {
                      display: true,
                      text: `Count of ${targetTypeLabel} with ${numberField.label}`,
                    },
                  },
                }}
                data={createDataForPieCount(issueResponseJson)}
              />
            )}
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
                    text:
                      (numberField?.value ?? "").length > 0
                        ? `Sum of ${numberField.label}`
                        : `Count of ${targetTypeLabel}`,
                  },
                },
              }}
              data={createDataForSum(issueResponseJson)}
            />
          </Box>
          {(numberField?.value ?? "").length > 0 && (
            <>
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
                        text: `Count of ${targetTypeLabel} with ${numberField.label}`,
                      },
                    },
                  }}
                  data={createDataForCount(issueResponseJson)}
                />
              </Box>
            </>
          )}
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
                      text: `Count of ${targetTypeLabel}`,
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
                    text:
                      (numberField?.value ?? "").length > 0
                        ? `Sum of ${numberField.label}`
                        : `Count of ${targetTypeLabel}`,
                  },
                },
              }}
              data={createDataForSum(issueResponseJson)}
            />
          </Box>
          {(numberField?.value ?? "").length > 0 && (
            <>
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
                        text: `Count of ${targetTypeLabel} with ${numberField.label}`,
                      },
                    },
                  }}
                  data={createDataForCount(issueResponseJson)}
                />
              </Box>
            </>
          )}
        </>
      )}
      {reportMode === REPORT_MODE.STACKED_RATIO_BAR && (
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
                    text:
                      (numberField?.value ?? "").length > 0
                        ? `Sum of ${numberField.label}`
                        : `Count of ${targetTypeLabel}`,
                  },
                },
              }}
              data={createDataForSum(issueResponseJson, true)}
            />
          </Box>
          {(numberField?.value ?? "").length > 0 && (
            <>
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
                        text: `Count of ${targetTypeLabel} with ${numberField.label}`,
                      },
                    },
                  }}
                  data={createDataForCount(issueResponseJson, true)}
                />
              </Box>
            </>
          )}
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
                      text: `Count of ${targetTypeLabel}`,
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
                    text:
                      (numberField?.value ?? "").length > 0
                        ? `Sum of ${numberField.label}`
                        : `Count of ${targetTypeLabel}`,
                  },
                },
              }}
              data={createDataForSum(issueResponseJson)}
            />
          </Box>
          {(numberField?.value ?? "").length > 0 && (
            <>
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
                        text: `Count of ${targetTypeLabel} with ${numberField.label}`,
                      },
                    },
                  }}
                  data={createDataForCount(issueResponseJson)}
                />
              </Box>
            </>
          )}
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
                      text: `Count of ${targetTypeLabel}`,
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
      {reportMode === REPORT_MODE.CFD && (
        <>
          <Box>
            <Line
              options={{
                responsive: true,
                y: {
                  stacked: true,
                  min: 0,
                },
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                  title: {
                    display: true,
                    text: `Cumulative Flow Diagram`,
                  },
                },
              }}
              data={createDataForCFD(issueResponseJson)}
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
