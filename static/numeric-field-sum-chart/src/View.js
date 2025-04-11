import React, { useEffect, useState, useRef } from "react";
import { invoke } from "@forge/bridge";
import { Box, Inline } from "@atlaskit/primitives";
import { IconButton } from "@atlaskit/button/new";
import DynamicTable from "@atlaskit/dynamic-table";
import SVG from "@atlaskit/icon/svg";
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
  const [secondaryChartVisibleMode, setSecondaryChartVisibleMode] =
    useState("show");
  const [chartVisibleMode, setChartVisibleMode] = useState("show");
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

  const ChartIcon = (props) => {
    const { size, mode } = props;
    return mode === "show" ? (
      <SVG size={size}>
        <path
          fill="currentColor"
          d="M21 5.47L12 12L7.62 7.62L3 11V8.52L7.83 5l4.38 4.38L21 3zM21 15h-4.7l-4.17 3.34L6 12.41l-3 2.13V17l2.8-2l6.2 6l5-4h4z"
          stroke-width="1.0"
          stroke="currentColor"
        />
      </SVG>
    ) : (
      <SVG size={size}>
        <path
          fill="currentColor"
          d="M21 5.47L12 12L7.62 7.62L3 11V8.52L7.83 5l4.38 4.38L21 3zM21 15h-4.7l-4.17 3.34L6 12.41l-3 2.13V17l2.8-2l6.2 6l5-4h4z"
        />
      </SVG>
    );
  };

  const SecondaryChartIcon = (props) => {
    const { size, mode } = props;
    return mode === "show" ? (
      <SVG size={size}>
        <path fill="currentColor" d="M4 9h4v11H4zm12 4h4v7h-4zm-6-9h4v16h-4z" />
      </SVG>
    ) : (
      <SVG size={size}>
        <path
          fill="currentColor"
          d="M4 20V9h4v11zm6 0V10l4 4v6zm4-8.85l-4-4V4h4zm6 6l-4-4V13h4zm-.225 5.475l-18.4-18.4L2.8 2.8l18.4 18.4z"
          stroke-width="0.8"
          stroke="currentColor"
        />
      </SVG>
    );
  };

  const chartRef = useRef();
  const chartRef2 = useRef();

  const toggleChartVisible = () => {
    setChartVisible(chartRef.current, chartVisibleMode !== "show");
    setChartVisible(chartRef2.current, chartVisibleMode !== "show");
    setChartVisibleMode(chartVisibleMode === "show" ? "hide" : "show");
  };

  const setChartVisible = (chart, visible) => {
    if (chart) {
      let i = 0;
      while (true) {
        const meta = chart.getDatasetMeta(i);
        if (!meta?.type) break;
        chart.setDatasetVisibility(i, visible);
        i++;
      }
      chart.update();
    }
  };

  const toggleSecondChartVisible = () => {
    setSecondaryChartVisibleMode(
      secondaryChartVisibleMode === "show" ? "hide" : "show"
    );
  };

  return issueResponseJson ? (
    <>
      {reportMode !== REPORT_MODE.TABLE && (
        <Inline alignBlock="center" spread="end">
          {reportMode !== REPORT_MODE.PIE &&
            reportMode !== REPORT_MODE.DOUGHNUT && (
              <IconButton
                icon={(iconProps) => (
                  <ChartIcon
                    {...iconProps}
                    size="small"
                    mode={chartVisibleMode}
                  />
                )}
                appearance="subtle"
                spacing="compact"
                onClick={() => toggleChartVisible(chartRef)}
                isTooltipDisabled={true}
              ></IconButton>
            )}
          <IconButton
            icon={(iconProps) => (
              <SecondaryChartIcon
                {...iconProps}
                size="small"
                mode={secondaryChartVisibleMode}
              />
            )}
            appearance="subtle"
            spacing="compact"
            onClick={() => toggleSecondChartVisible(chartRef)}
            isTooltipDisabled={true}
          ></IconButton>
        </Inline>
      )}
      {reportMode === REPORT_MODE.PIE && (
        <>
          <Box>
            <Pie
              ref={chartRef}
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
            {(numberField?.value ?? "").length > 0 &&
              secondaryChartVisibleMode === "show" && (
                <Pie
                  ref={chartRef2}
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
              ref={chartRef}
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
            {(numberField?.value ?? "").length > 0 &&
              secondaryChartVisibleMode === "show" && (
                <Doughnut
                  ref={chartRef2}
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
              ref={chartRef}
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
          {(numberField?.value ?? "").length > 0 &&
            secondaryChartVisibleMode === "show" && (
              <>
                <Box padding="space.100" />
                <Box>
                  <Bar
                    ref={chartRef2}
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
            {secondaryChartVisibleMode === "show" && (
              <Bar
                ref={chartRef}
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
            )}
            {secondaryChartVisibleMode === "hide" && (
              <Bar
                ref={chartRef}
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
            )}
          </Box>
        </>
      )}
      {reportMode === REPORT_MODE.STACKED_BAR && (
        <>
          <Box>
            <Bar
              ref={chartRef}
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
          {(numberField?.value ?? "").length > 0 &&
            secondaryChartVisibleMode === "show" && (
              <>
                <Box padding="space.100" />
                <Box>
                  <Bar
                    ref={chartRef2}
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
              ref={chartRef}
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
          {(numberField?.value ?? "").length > 0 &&
            secondaryChartVisibleMode === "show" && (
              <>
                <Box padding="space.100" />
                <Box>
                  <Bar
                    ref={chartRef2}
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
            {secondaryChartVisibleMode === "show" && (
              <Bar
                ref={chartRef}
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
            )}
            {secondaryChartVisibleMode === "hide" && (
              <Bar
                ref={chartRef}
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
            )}
          </Box>
        </>
      )}
      {reportMode === REPORT_MODE.LINE && (
        <>
          <Box>
            <Line
              ref={chartRef}
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
          {(numberField?.value ?? "").length > 0 &&
            secondaryChartVisibleMode === "show" && (
              <>
                <Box padding="space.100" />
                <Box>
                  <Line
                    ref={chartRef2}
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
            {secondaryChartVisibleMode === "show" && (
              <Line
                ref={chartRef}
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
            )}
            {secondaryChartVisibleMode === "hide" && (
              <Line
                ref={chartRef}
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
            )}
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
