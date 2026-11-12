
"use strict";

/* =========================================
   TASFIAS CALCULATION WORLD
   Main JavaScript
========================================= */

const $ = (id) => document.getElementById(id);

function showMessage(id, message) {
  const element = $(id);
  if (element) element.innerHTML = message;
}

function numbersFrom(id) {
  const value = $(id)?.value || "";
  const values = value.split(/[\s,]+/).filter(Boolean).map(Number);
  if (!values.length || values.some(n => !Number.isFinite(n))) {
    throw new Error("Please enter valid numbers separated by commas.");
  }
  return values;
}

function format(n) {
  if (!Number.isFinite(n)) return "Undefined";
  return Number(n.toFixed(8)).toString();
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function variance(arr) {
  const m = mean(arr);
  return arr.reduce((sum, n) => sum + (n - m) ** 2, 0) / arr.length;
}

function stdDev(arr) {
  return Math.sqrt(variance(arr));
}

function factorial(n) {
  if (!Number.isInteger(n) || n < 0 || n > 170) {
    throw new Error("Factorial requires an integer from 0 to 170.");
  }
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function safeNumbers(id) {
  const el = $(id);
  const n = Number(el?.value);
  if (!el || el.value.trim() === "" || !Number.isFinite(n)) {
    throw new Error("Please enter a valid number.");
  }
  return n;
}

/* =========================================
   PAGE NAVIGATION
========================================= */

const pageTitles = {
  dashboard: "Dashboard",
  scientific: "Scientific Calculator",
  statistics: "Statistics",
  probability: "Probability",
  metrics: "ML Metrics",
  matrix: "Linear Algebra",
  data: "Data Science Tools",
  "ai-solver": "AI Image Solver",
  "ai-assistant": "AI Data Science Assistant",
  "dataset-lab": "Dataset Analyzer",
  "advanced-lab": "Research Labs",
  "research-workspace": "Research Workspace",
  plans: "Membership",
  account: "My Account"
};

function showPage(pageId) {
  if (!$(pageId)) pageId = "dashboard";

  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  document.querySelectorAll("[data-page]").forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  const title = pageTitles[pageId] || "Dashboard";
  if ($("pageTitle")) $("pageTitle").textContent = title;
  if ($("topHeading")) $("topHeading").textContent = title;

  $("sidebar")?.classList.remove("sidebar-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) showPage(pageButton.dataset.page);
});

$("menuButton")?.addEventListener("click", () => {
  $("sidebar")?.classList.toggle("sidebar-open");
});

/* =========================================
   SCIENTIFIC CALCULATOR
========================================= */

const display = $("display");
const calcHistory = [];

function insertValue(value) {
  if (!display) return;
  const start = display.selectionStart ?? display.value.length;
  const end = display.selectionEnd ?? display.value.length;
  display.value = display.value.slice(0, start) + value + display.value.slice(end);
  display.focus();
  const position = start + value.length;
  display.setSelectionRange(position, position);
}

function calculateExpression(expression) {
  let exp = expression.replace(/\s/g, "");
  if (!exp) throw new Error("Enter a calculation first.");

  if (!/^[0-9+\-*/().,!%^πeA-Za-z]+$/.test(exp)) {
    throw new Error("Invalid characters in expression.");
  }

  exp = exp.replace(/π/g, "Math.PI")
    .replace(/\be\b/g, "Math.E")
    .replace(/\^/g, "**")
    .replace(/\bsqrt\(/g, "Math.sqrt(")
    .replace(/\bsin\(/g, "Math.sin(Math.PI/180*")
    .replace(/\bcos\(/g, "Math.cos(Math.PI/180*")
    .replace(/\btan\(/g, "Math.tan(Math.PI/180*")
    .replace(/\blog\(/g, "Math.log10(")
    .replace(/\bln\(/g, "Math.log(");

  // Factorial of simple numeric values, e.g. 5!
  exp = exp.replace(/(\d+(?:\.\d+)?)!/g, (_, n) => `factorial(${n})`);

  if (!/^[0-9+\-*/().,!%^A-Za-z]+$/.test(exp)) {
    throw new Error("Invalid mathematical expression.");
  }

  const result = Function("factorial", '"use strict"; return (' + exp + ')')(factorial);
  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("The result is not a finite number.");
  }
  return result;
}

document.querySelectorAll("[data-insert]").forEach(button => {
  button.addEventListener("click", () => insertValue(button.dataset.insert));
});

$("clear")?.addEventListener("click", () => {
  display.value = "";
  $("calcResult").textContent = "0";
});

$("delete")?.addEventListener("click", () => {
  const start = display.selectionStart ?? display.value.length;
  const end = display.selectionEnd ?? display.value.length;
  if (start !== end) {
    display.value = display.value.slice(0, start) + display.value.slice(end);
    display.setSelectionRange(start, start);
  } else if (start > 0) {
    display.value = display.value.slice(0, start - 1) + display.value.slice(start);
    display.setSelectionRange(start - 1, start - 1);
  }
  display.focus();
});

function runCalculator() {
  try {
    const result = calculateExpression(display.value);
    $("calcResult").textContent = format(result);
    calcHistory.unshift(`${display.value} = ${format(result)}`);
    calcHistory.splice(5);
    $("calcHistory").innerHTML = "<h4>Recent calculations</h4>" +
      calcHistory.map(item => `<p>${escapeHTML(item)}</p>`).join("");
  } catch (error) {
    $("calcResult").textContent = error.message;
  }
}

$("calculate")?.addEventListener("click", runCalculator);
display?.addEventListener("keydown", event => {
  if (event.key === "Enter") runCalculator();
});

/* =========================================
   STATISTICS
========================================= */

$("statsCalculate")?.addEventListener("click", () => {
  try {
    const a = numbersFrom("statsInput");
    const sorted = [...a].sort((x, y) => x - y);
    const counts = new Map();
    a.forEach(n => counts.set(n, (counts.get(n) || 0) + 1));
    const maxCount = Math.max(...counts.values());
    const modes = [...counts].filter(([, c]) => c === maxCount).map(([n]) => n);
    const modeText = maxCount === 1 ? "No repeated mode" : modes.join(", ");

    showMessage("statsOutput", `
      <h4>Statistical Results</h4>
      <table>
        <tr><td>Count</td><td>${a.length}</td></tr>
        <tr><td>Sum</td><td>${format(a.reduce((x,y)=>x+y,0))}</td></tr>
        <tr><td>Mean</td><td>${format(mean(a))}</td></tr>
        <tr><td>Median</td><td>${format(median(a))}</td></tr>
        <tr><td>Mode</td><td>${escapeHTML(modeText)}</td></tr>
        <tr><td>Minimum</td><td>${format(sorted[0])}</td></tr>
        <tr><td>Maximum</td><td>${format(sorted.at(-1))}</td></tr>
        <tr><td>Range</td><td>${format(sorted.at(-1)-sorted[0])}</td></tr>
        <tr><td>Population Variance</td><td>${format(variance(a))}</td></tr>
        <tr><td>Population Standard Deviation</td><td>${format(stdDev(a))}</td></tr>
      </table>`);
  } catch (error) {
    showMessage("statsOutput", escapeHTML(error.message));
  }
});

function pearson(x, y) {
  if (x.length !== y.length || x.length < 2) {
    throw new Error("Both variables must have the same number of values (at least 2).");
  }
  const mx = mean(x), my = mean(y);
  const numerator = x.reduce((s, n, i) => s + (n-mx)*(y[i]-my), 0);
  const dx = Math.sqrt(x.reduce((s,n) => s+(n-mx)**2,0));
  const dy = Math.sqrt(y.reduce((s,n) => s+(n-my)**2,0));
  if (dx === 0 || dy === 0) throw new Error("Correlation cannot be calculated for a constant variable.");
  return numerator / (dx * dy);
}

$("correlationCalculate")?.addEventListener("click", () => {
  try {
    const r = pearson(numbersFrom("seriesX"), numbersFrom("seriesY"));
    let strength = Math.abs(r) >= .7 ? "Strong" : Math.abs(r) >= .3 ? "Moderate" : "Weak";
    showMessage("correlationOutput", `
      <h4>Pearson Correlation</h4>
      <p><strong>r = ${format(r)}</strong></p>
      <p>${strength} ${r >= 0 ? "positive" : "negative"} correlation.</p>`);
  } catch (error) {
    showMessage("correlationOutput", escapeHTML(error.message));
  }
});

/* =========================================
   PROBABILITY
========================================= */

$("basicProbability")?.addEventListener("click", () => {
  try {
    const f = safeNumbers("favorable"), t = safeNumbers("total");
    if (f < 0 || t <= 0 || f > t) throw new Error("Use valid outcomes: 0 ≤ favorable ≤ total.");
    const p = f / t;
    showMessage("basicProbabilityOutput",
      `<h4>Probability = ${format(p)}</h4><p>${format(p*100)}%</p><p>P(A) = Favorable Outcomes / Total Outcomes</p>`);
  } catch (error) { showMessage("basicProbabilityOutput", escapeHTML(error.message)); }
});

function countingValue(n, r, permutation) {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n || n > 170) {
    throw new Error("Use integers with 0 ≤ r ≤ n ≤ 170.");
  }
  return permutation ? factorial(n) / factorial(n-r) :
    factorial(n) / (factorial(r)*factorial(n-r));
}

function runCounting(permutation) {
  try {
    const n = safeNumbers("nValue"), r = safeNumbers("rValue");
    const value = countingValue(n, r, permutation);
    showMessage("countingOutput",
      `<h4>${permutation ? "Permutation (nPr)" : "Combination (nCr)"}</h4><p>Result: <strong>${format(value)}</strong></p>`);
  } catch (error) { showMessage("countingOutput", escapeHTML(error.message)); }
}

$("permutationBtn")?.addEventListener("click", () => runCounting(true));
$("combinationBtn")?.addEventListener("click", () => runCounting(false));

$("binomialBtn")?.addEventListener("click", () => {
  try {
    const n = safeNumbers("binN"), k = safeNumbers("binK"), p = safeNumbers("binP");
    if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || n > 170 || k < 0 || k > n || p < 0 || p > 1) {
      throw new Error("Use valid n, k and probability (0 ≤ p ≤ 1).");
    }
    const result = countingValue(n, k, false) * Math.pow(p,k) * Math.pow(1-p,n-k);
    showMessage("binomialOutput", `<h4>Binomial Probability</h4><p>P(X = ${k}) = <strong>${format(result)}</strong></p><p>${format(result*100)}%</p>`);
  } catch (error) { showMessage("binomialOutput", escapeHTML(error.message)); }
});

/* =========================================
   MACHINE LEARNING METRICS
========================================= */

$("metricsCalculate")?.addEventListener("click", () => {
  try {
    const tp = safeNumbers("tp"), fp = safeNumbers("fp");
    const fn = safeNumbers("fn"), tn = safeNumbers("tn");
    if ([tp,fp,fn,tn].some(n => n < 0)) throw new Error("Values cannot be negative.");
    const total = tp+fp+fn+tn;
    if (!total) throw new Error("Enter at least one observation.");

    const accuracy = (tp+tn)/total;
    const precision = tp+fp ? tp/(tp+fp) : 0;
    const recall = tp+fn ? tp/(tp+fn) : 0;
    const f1 = precision+recall ? 2*precision*recall/(precision+recall) : 0;
    const specificity = tn+fp ? tn/(tn+fp) : 0;

    showMessage("metricsOutput", `
      <h4>Model Evaluation Results</h4>
      <table>
        <tr><td>Accuracy</td><td>${format(accuracy*100)}%</td></tr>
        <tr><td>Precision</td><td>${format(precision*100)}%</td></tr>
        <tr><td>Recall</td><td>${format(recall*100)}%</td></tr>
        <tr><td>F1 Score</td><td>${format(f1*100)}%</td></tr>
        <tr><td>Specificity</td><td>${format(specificity*100)}%</td></tr>
        <tr><td>Total Samples</td><td>${total}</td></tr>
      </table>`);
  } catch (error) { showMessage("metricsOutput", escapeHTML(error.message)); }
});

/* =========================================
   MATRIX & VECTOR
========================================= */

function readMatrix(id) {
  const rows = $(id).value.trim().split(/\n+/).map(row =>
    row.split(/[\s,]+/).filter(Boolean).map(Number));
  if (!rows.length || rows.some(row => row.some(n => !Number.isFinite(n)))) {
    throw new Error("Enter a valid matrix.");
  }
  if (rows.some(row => row.length !== rows[0].length)) {
    throw new Error("Every matrix row must have the same number of values.");
  }
  return rows;
}

function matrixHTML(matrix) {
  return `<table>${matrix.map(row => `<tr>${row.map(n => `<td>${format(n)}</td>`).join("")}</tr>`).join("")}</table>`;
}

document.querySelectorAll("[data-matrix]").forEach(button => {
  button.addEventListener("click", () => {
    try {
      const operation = button.dataset.matrix;
      const A = readMatrix("matrixA");
      const B = readMatrix("matrixB");
      let result;

      if (operation === "transpose") {
        result = A[0].map((_, i) => A.map(row => row[i]));
      } else if (operation === "determinant") {
        if (A.length !== 2 || A[0].length !== 2) throw new Error("Determinant is available for 2×2 matrices.");
        const det = A[0][0]*A[1][1] - A[0][1]*A[1][0];
        showMessage("matrixOutput", `<h4>Determinant of A</h4><strong>${format(det)}</strong>`);
        return;
      } else {
        if (A.length !== B.length || A[0].length !== B[0].length) throw new Error("Matrices must have the same dimensions.");
        if (operation === "add") result = A.map((row,i)=>row.map((n,j)=>n+B[i][j]));
        if (operation === "subtract") result = A.map((row,i)=>row.map((n,j)=>n-B[i][j]));
        if (operation === "multiply") {
          if (A[0].length !== B.length) throw new Error("Columns of A must equal rows of B.");
          result = A.map((row,i)=>B[0].map((_,j)=>
            row.reduce((sum,n,k)=>sum+n*B[k][j],0)));
        }
      }
      showMessage("matrixOutput", `<h4>Result</h4>${matrixHTML(result)}`);
    } catch (error) { showMessage("matrixOutput", escapeHTML(error.message)); }
  });
});

$("vectorCalculate")?.addEventListener("click", () => {
  try {
    const a = numbersFrom("vectorA"), b = numbersFrom("vectorB");
    if (a.length !== b.length) throw new Error("Both vectors must have equal dimensions.");
    const dot = a.reduce((sum,n,i)=>sum+n*b[i],0);
    showMessage("vectorOutput", `<h4>Dot Product</h4><strong>${format(dot)}</strong>`);
  } catch (error) { showMessage("vectorOutput", escapeHTML(error.message)); }
});

/* =========================================
   DATA PREPROCESSING
========================================= */

$("minMaxBtn")?.addEventListener("click", () => {
  try {
    const a = numbersFrom("dataInput"), min = Math.min(...a), max = Math.max(...a);
    const result = max === min ? a.map(() => 0) : a.map(n => (n-min)/(max-min));
    showMessage("dataOutput", `<h4>Min-Max Scaled Values</h4><p>${result.map(format).join(", ")}</p><p>Range: 0 to 1</p>`);
  } catch (error) { showMessage("dataOutput", escapeHTML(error.message)); }
});

$("zScoreBtn")?.addEventListener("click", () => {
  try {
    const a = numbersFrom("dataInput"), m = mean(a), sd = stdDev(a);
    if (sd === 0) throw new Error("Z-score cannot be calculated when all values are equal.");
    const result = a.map(n => (n-m)/sd);
    showMessage("dataOutput", `<h4>Z-Score Values</h4><p>${result.map(format).join(", ")}</p><p>Mean: ${format(m)} | SD: ${format(sd)}</p>`);
  } catch (error) { showMessage("dataOutput", escapeHTML(error.message)); }
});

$("outlierBtn")?.addEventListener("click", () => {
  try {
    const a = numbersFrom("dataInput").sort((x,y)=>x-y);
    const q1 = median(a.slice(0,Math.floor(a.length/2)));
    const q3 = median(a.slice(Math.ceil(a.length/2)));
    const iqr = q3-q1;
    const low = q1-1.5*iqr, high = q3+1.5*iqr;
    const outliers = a.filter(n=>n<low || n>high);
    showMessage("dataOutput", `<h4>IQR Outlier Detection</h4><p>Q1: ${format(q1)} | Q3: ${format(q3)}</p><p>IQR: ${format(iqr)}</p><p>Lower limit: ${format(low)} | Upper limit: ${format(high)}</p><p>Outliers: ${outliers.length ? outliers.join(", ") : "None detected"}</p>`);
  } catch (error) { showMessage("dataOutput", escapeHTML(error.message)); }
});

$("splitPercent")?.addEventListener("input", event => {
  $("splitLabel").textContent = event.target.value + "%";
});

$("datasetBtn")?.addEventListener("click", () => {
  try {
    const total = safeNumbers("totalRows"), missing = safeNumbers("missingRows");
    const pct = safeNumbers("splitPercent");
    if (total <= 0 || missing < 0 || missing > total) throw new Error("Enter valid row counts.");
    const usable = total-missing;
    const train = Math.floor(usable*pct/100);
    showMessage("datasetOutput", `<h4>Dataset Split</h4><p>Total rows: ${total}</p><p>Missing rows: ${missing}</p><p>Usable rows: ${usable}</p><p>Training rows (${pct}%): ${train}</p><p>Testing rows (${100-pct}%): ${usable-train}</p>`);
  } catch (error) { showMessage("datasetOutput", escapeHTML(error.message)); }
});

function categories() {
  const a = $("categoryInput").value.split(",").map(s=>s.trim()).filter(Boolean);
  if (!a.length) throw new Error("Enter at least one category.");
  return a;
}

$("labelEncodeBtn")?.addEventListener("click", () => {
  try {
    const a = categories(), unique = [...new Set(a)];
    const mapping = Object.fromEntries(unique.map((v,i)=>[v,i]));
    showMessage("encodingOutput", `<h4>Label Encoding</h4><p>${JSON.stringify(mapping)}</p><p>Encoded: ${a.map(v=>mapping[v]).join(", ")}</p>`);
  } catch (error) { showMessage("encodingOutput", escapeHTML(error.message)); }
});

$("oneHotBtn")?.addEventListener("click", () => {
  try {
    const a = categories(), unique = [...new Set(a)];
    const rows = a.map(v=>unique.map(c=>c===v?1:0));
    showMessage("encodingOutput", `<h4>One-Hot Encoding</h4><p>Categories: ${escapeHTML(unique.join(", "))}</p>${matrixHTML(rows)}`);
  } catch (error) { showMessage("encodingOutput", escapeHTML(error.message)); }
});

/* =========================================
   AI IMAGE SOLVER - FRONTEND PREVIEW
========================================= */

let imageURL = null;

$("problemImage")?.addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showMessage("imageSolverOutput", "Please select an image file.");
    return;
  }
  if (file.size > 8*1024*1024) {
    showMessage("imageSolverOutput", "Image must be smaller than 8 MB.");
    event.target.value = "";
    return;
  }
  if (imageURL) URL.revokeObjectURL(imageURL);
  imageURL = URL.createObjectURL(file);
  $("imagePreview").src = imageURL;
  $("imagePreview").hidden = false;
  showMessage("imageSolverOutput", `<strong>${escapeHTML(file.name)}</strong><p>Image uploaded successfully. Add your instructions and connect an AI backend to recognize and solve this image.</p>`);
});

$("solveImageBtn")?.addEventListener("click", () => {
  if (!imageURL) {
    showMessage("imageSolverOutput", "Please upload an image first.");
    return;
  }
  showMessage("imageSolverOutput", "Your image is ready. Automatic image recognition and step-by-step AI solving require a connected AI API and backend. This demo does not send your image to an AI service.");
});

/* =========================================
   AI ASSISTANT - FRONTEND DEMO
========================================= */

$("askAssistantBtn")?.addEventListener("click", () => {
  const prompt = $("assistantPrompt").value.trim();
  if (!prompt) {
    showMessage("assistantOutput", "Please enter your question first.");
    return;
  }
  const mode = $("assistantMode").selectedOptions[0].text;
  showMessage("assistantOutput", `<h4>Request prepared</h4><p><strong>Task:</strong> ${escapeHTML(mode)}</p><p><strong>Your question:</strong> ${escapeHTML(prompt)}</p><p>A live AI response requires a secure server-side AI API connection. No external AI service is connected in this version.</p>`);
});

/* =========================================
   DATASET ANALYZER - CSV
========================================= */

let dataset = null;
let datasetHeaders = [];
let datasetRows = [];

function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;

  for (let i=0; i<text.length; i++) {
    const ch = text[i], next = text[i+1];
    if (ch === '"' && quoted && next === '"') {
      cell += '"'; i++;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === "," && !quoted) {
      row.push(cell); cell = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell); cell = "";
      if (row.some(v=>v.trim() !== "")) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some(v=>v.trim() !== "")) rows.push(row);
  return rows;
}

$("datasetFile")?.addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 10*1024*1024) {
    showMessage("datasetFileInfo", "File must be smaller than 10 MB.");
    event.target.value = "";
    return;
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    showMessage("datasetFileInfo", "Please select a CSV file.");
    event.target.value = "";
    return;
  }

  try {
    const text = await file.text();
    const parsed = parseCSV(text);
    if (parsed.length < 2) throw new Error("Dataset must contain a header and at least one data row.");
    datasetHeaders = parsed[0].map((v,i)=>v.trim() || `Column ${i+1}`);
    datasetRows = parsed.slice(1).filter(r=>r.length > 0).map(r=>
      datasetHeaders.map((_,i)=>(r[i] ?? "").trim()));
    dataset = { headers: datasetHeaders, rows: datasetRows };
    showMessage("datasetFileInfo", `<h4>Dataset loaded successfully</h4><p>File: ${escapeHTML(file.name)}</p><p>Rows: ${datasetRows.length} | Columns: ${datasetHeaders.length}</p>`);
    showMessage("datasetAnalyzerOutput", "Dataset is ready. Choose an analysis tool.");
  } catch (error) {
    dataset = null;
    showMessage("datasetFileInfo", escapeHTML(error.message));
  }
});

function requireDataset() {
  if (!dataset || !datasetRows.length) throw new Error("Please upload a CSV dataset first.");
  return dataset;
}

function numericColumn(index) {
  const values = datasetRows.map(r=>r[index]).filter(v=>v !== "").map(Number);
  if (!values.length || values.some(v=>!Number.isFinite(v))) return null;
  return values;
}

$("datasetProfileBtn")?.addEventListener("click", () => {
  try {
    requireDataset();
    const details = datasetHeaders.map((h,i)=>{
      const values = datasetRows.map(r=>r[i]).filter(v=>v !== "");
      const nums = numericColumn(i);
      return `<tr><td>${escapeHTML(h)}</td><td>${nums ? "Numeric" : "Text / Mixed"}</td><td>${values.length}</td></tr>`;
    }).join("");
    showMessage("datasetAnalyzerOutput", `<h4>Dataset Profile</h4><p>Rows: ${datasetRows.length} | Columns: ${datasetHeaders.length}</p><table><tr><th>Column</th><th>Type</th><th>Non-empty</th></tr>${details}</table>`);
  } catch (error) { showMessage("datasetAnalyzerOutput", escapeHTML(error.message)); }
});

$("missingAnalysisBtn")?.addEventListener("click", () => {
  try {
    requireDataset();
    const rows = datasetHeaders.map((h,i)=>{
      const missing = datasetRows.filter(r=>!r[i]).length;
      return `<tr><td>${escapeHTML(h)}</td><td>${missing}</td><td>${format(missing/datasetRows.length*100)}%</td></tr>`;
    }).join("");
    showMessage("datasetAnalyzerOutput", `<h4>Missing Value Analysis</h4><table><tr><th>Column</th><th>Missing</th><th>Percentage</th></tr>${rows}</table>`);
  } catch (error) { showMessage("datasetAnalyzerOutput", escapeHTML(error.message)); }
});

$("duplicateAnalysisBtn")?.addEventListener("click", () => {
  try {
    requireDataset();
    const seen = new Set();
    let duplicates = 0;
    datasetRows.forEach(r=>{
      const key = JSON.stringify(r);
      if (seen.has(key)) duplicates++;
      else seen.add(key);
    });
    showMessage("datasetAnalyzerOutput", `<h4>Duplicate Analysis</h4><p>Total duplicate rows: <strong>${duplicates}</strong></p><p>Unique rows: ${seen.size}</p>`);
  } catch (error) { showMessage("datasetAnalyzerOutput", escapeHTML(error.message)); }
});

$("outlierAnalysisBtn")?.addEventListener("click", () => {
  try {
    requireDataset();
    const results = [];
    datasetHeaders.forEach((h,i)=>{
      const a = numericColumn(i);
      if (!a || a.length < 4) return;
      const sorted = [...a].sort((x,y)=>x-y);
      const q1 = median(sorted.slice(0,Math.floor(sorted.length/2)));
      const q3 = median(sorted.slice(Math.ceil(sorted.length/2)));
      const iqr = q3-q1;
      const out = a.filter(n=>n<q1-1.5*iqr || n>q3+1.5*iqr);
      results.push(`<tr><td>${escapeHTML(h)}</td><td>${out.length}</td><td>${out.map(format).join(", ") || "None"}</td></tr>`);
    });
    showMessage("datasetAnalyzerOutput", `<h4>IQR Outlier Analysis</h4>${results.length ? `<table><tr><th>Column</th><th>Count</th><th>Outlier values</th></tr>${results.join("")}</table>` : "No suitable numeric columns found."}`);
  } catch (error) { showMessage("datasetAnalyzerOutput", escapeHTML(error.message)); }
});

$("correlationAnalysisBtn")?.addEventListener("click", () => {
  try {
    requireDataset();
    const columns = datasetHeaders.map((h,i)=>({name:h,values:numericColumn(i)})).filter(c=>c.values && c.values.length===datasetRows.length);
    if (columns.length < 2) throw new Error("At least two complete numeric columns are needed.");
    const rows = [];
    columns.forEach((a,i)=>columns.slice(i+1).forEach(b=>{
      rows.push(`<tr><td>${escapeHTML(a.name)}</td><td>${escapeHTML(b.name)}</td><td>${format(pearson(a.values,b.values))}</td></tr>`);
    }));
    showMessage("datasetAnalyzerOutput", `<h4>Pearson Correlation</h4><table><tr><th>Variable X</th><th>Variable Y</th><th>r</th></tr>${rows.join("")}</table>`);
  } catch (error) { showMessage("datasetAnalyzerOutput", escapeHTML(error.message)); }
});

$("visualizationBtn")?.addEventListener("click", () => {
  try {
    requireDataset();
    const index = datasetHeaders.findIndex((_,i)=>numericColumn(i));
    if (index < 0) throw new Error("No numeric column found.");
    const values = numericColumn(index);
    drawChart(values, datasetHeaders[index]);
    showMessage("datasetAnalyzerOutput", `<h4>Column Visualization</h4><p>Showing numeric column: ${escapeHTML(datasetHeaders[index])}</p>`);
  } catch (error) { showMessage("datasetAnalyzerOutput", escapeHTML(error.message)); }
});

function drawChart(values, title) {
  const canvas = $("datasetChart");
  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth || 600;
  const height = 220;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = width*ratio;
  canvas.height = height*ratio;
  ctx.scale(ratio,ratio);
  ctx.clearRect(0,0,width,height);

  const max = Math.max(...values), min = Math.min(...values);
  const range = max-min || 1;
  const step = width/Math.max(values.length,1);
  const barWidth = Math.max(2,step*.65);
  ctx.fillStyle = "#8065ed";
  values.slice(0,150).forEach((v,i)=>{
    const h = ((v-min)/range)*155+10;
    ctx.fillRect(i*step+step*.15,height-30-h,barWidth,h);
  });
  ctx.fillStyle = "#55536e";
  ctx.font = "11px Inter";
  ctx.fillText(title,10,15);
  ctx.fillText(`Min: ${format(min)}   Max: ${format(max)}`,10,height-8);
}

$("exportDatasetBtn")?.addEventListener("click", () => {
  try {
    requireDataset();
    const csv = [datasetHeaders,...datasetRows].map(row=>
      row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")
    ).join("\n");
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "tasfia-clean-dataset.csv";
    a.click();
    URL.revokeObjectURL(url);
    showMessage("datasetAnalyzerOutput", "CSV export started. This version preserves existing rows; it does not automatically clean missing values.");
  } catch (error) { showMessage("datasetAnalyzerOutput", escapeHTML(error.message)); }
});

/* =========================================
   RESEARCH LABS
========================================= */

$("regressionBtn")?.addEventListener("click", () => {
  try {
    const x = numbersFrom("regX"), y = numbersFrom("regY");
    if (x.length !== y.length || x.length < 2) throw new Error("X and Y must have the same number of values.");
    const mx = mean(x), my = mean(y);
    const numerator = x.reduce((s,n,i)=>s+(n-mx)*(y[i]-my),0);
    const denominator = x.reduce((s,n)=>s+(n-mx)**2,0);
    if (!denominator) throw new Error("X values must not all be equal.");
    const slope = numerator/denominator;
    const intercept = my-slope*mx;
    const predictions = x.map(n=>intercept+slope*n);
    const ssRes = y.reduce((s,n,i)=>s+(n-predictions[i])**2,0);
    const ssTot = y.reduce((s,n)=>s+(n-my)**2,0);
    const r2 = ssTot === 0 ? 1 : 1-ssRes/ssTot;
    showMessage("regressionOutput", `<h4>Linear Regression Results</h4><p>Slope: ${format(slope)}</p><p>Intercept: ${format(intercept)}</p><p>Equation: y = ${format(slope)}x + ${format(intercept)}</p><p>R²: ${format(r2)}</p>`);
  } catch (error) { showMessage("regressionOutput", escapeHTML(error.message)); }
});

$("ciBtn")?.addEventListener("click", () => {
  try {
    const m = safeNumbers("ciMean"), sd = safeNumbers("ciSD");
    const n = safeNumbers("ciN"), z = safeNumbers("ciLevel");
    if (sd < 0 || n <= 0) throw new Error("Standard deviation must be non-negative and sample size positive.");
    const margin = z*sd/Math.sqrt(n);
    showMessage("ciOutput", `<h4>Confidence Interval</h4><p>Standard Error: ${format(sd/Math.sqrt(n))}</p><p>Margin of Error: ${format(margin)}</p><p>Lower Limit: ${format(m-margin)}</p><p>Upper Limit: ${format(m+margin)}</p><p>Assumes a known population SD or a suitable large-sample normal approximation.</p>`);
  } catch (error) { showMessage("ciOutput", escapeHTML(error.message)); }
});

$("normalBtn")?.addEventListener("click", () => {
  try {
    const x = safeNumbers("normalX"), m = safeNumbers("normalMean"), sd = safeNumbers("normalSD");
    if (sd <= 0) throw new Error("Standard deviation must be greater than zero.");
    const z = (x-m)/sd;
    showMessage("normalOutput", `<h4>Normal Distribution</h4><p>Z-score = (x − μ) / σ</p><p>Z = <strong>${format(z)}</strong></p><p>The value is ${format(Math.abs(z))} standard deviations ${z>=0?"above":"below"} the mean.</p>`);
  } catch (error) { showMessage("normalOutput", escapeHTML(error.message)); }
});

/* =========================================
   MEMBERSHIP DEMO
========================================= */

document.querySelectorAll(".plan-button").forEach(button => {
  button.addEventListener("click", () => {
    const plan = button.dataset.plan;
    showMessage("proMessage", `<h4>${escapeHTML(plan)} selected</h4><p>This is currently a demonstration only. No payment has been taken and no subscription has been activated.</p>`);
  });
});

/* =========================================
   ACCOUNT PROFILE - LOCAL STORAGE
========================================= */

function loadProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem("tasfiaProfile") || "{}");
    if ($("displayName")) $("displayName").value = profile.name || "";
    if ($("demoEmail")) $("demoEmail").value = profile.email || "";
  } catch {
    localStorage.removeItem("tasfiaProfile");
  }
}

$("saveProfile")?.addEventListener("click", () => {
  const name = $("displayName").value.trim();
  const email = $("demoEmail").value.trim();
  if (!name) {
    showMessage("profileMessage", "Please enter your display name.");
    return;
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showMessage("profileMessage", "Please enter a valid email address.");
    return;
  }
  localStorage.setItem("tasfiaProfile", JSON.stringify({name,email}));
  showMessage("profileMessage", "Profile saved in this browser successfully.");
});

/* =========================================
   HELPERS & INITIALIZATION
========================================= */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  })[char]);
}

loadProfile();
showPage("dashboard");



/* =========================================
   ADVANCED DATA QUALITY ENGINE
   Original dataset is preserved; cleaning
   happens on a separate working copy.
========================================= */

let advancedSourceRows = null;
let advancedWorkingRows = [];

function advancedGetRows() {
  requireDataset();

  // A new upload replaces datasetRows with a new array.
  // Detect that and start a fresh working copy.
  if (advancedSourceRows !== datasetRows) {
    advancedSourceRows = datasetRows;
    advancedWorkingRows = datasetRows.map(row => [...row]);
  }

  return advancedWorkingRows;
}

function advancedIsMissing(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function advancedIsNumericColumn(rows, columnIndex) {
  const values = rows
    .map(row => row[columnIndex])
    .filter(value => !advancedIsMissing(value));

  return values.length > 0 &&
    values.every(value => Number.isFinite(Number(value)));
}

function advancedMode(values) {
  const counts = new Map();
  values.filter(value => !advancedIsMissing(value)).forEach(value => {
    const key = String(value);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  if (!counts.size) return "";
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function advancedQuality(rows) {
  const totalCells = rows.length * datasetHeaders.length;
  if (!totalCells) {
    return { score: 0, missing: 0, duplicates: 0, completeness: 0 };
  }

  let missing = 0;
  rows.forEach(row => {
    datasetHeaders.forEach((_, index) => {
      if (advancedIsMissing(row[index])) missing++;
    });
  });

  const seen = new Set();
  let duplicates = 0;
  rows.forEach(row => {
    const key = JSON.stringify(row);
    if (seen.has(key)) duplicates++;
    else seen.add(key);
  });

  const completeness = (totalCells - missing) / totalCells;
  const duplicateFreeRate = rows.length ? (rows.length - duplicates) / rows.length : 1;
  const score = Math.max(0, Math.min(100,
    (completeness * 70 + duplicateFreeRate * 30)
  ));

  return {
    score: Math.round(score * 100) / 100,
    missing,
    duplicates,
    completeness: Math.round(completeness * 10000) / 100
  };
}

function advancedMessage(message) {
  const report = $("advancedReport");
  if (report) report.textContent = message;
}

function advancedAnalyze() {
  const rows = advancedGetRows();
  const quality = advancedQuality(rows);

  $("qualityScore").textContent = quality.score.toFixed(2);
  $("qualityMissing").textContent = quality.missing;
  $("qualityDuplicates").textContent = quality.duplicates;
  $("qualityComplete").textContent = quality.completeness + "%";
  $("qualityBar").style.width = quality.score + "%";

  advancedMessage(
    "Analysis completed. Current working dataset: " + rows.length +
    " rows × " + datasetHeaders.length + " columns. Quality score: " +
    quality.score.toFixed(2) + "/100."
  );

  return quality;
}

function advancedApplyMissing() {
  const rows = advancedGetRows();
  const strategy = $("missingStrategy").value;

  const before = advancedQuality(rows).missing;
  if (!before) {
    advancedAnalyze();
    advancedMessage("No missing values were found in the working dataset.");
    return;
  }

  let updated = rows.map(row => [...row]);

  if (strategy === "drop") {
    updated = updated.filter(row =>
      datasetHeaders.every((_, index) => !advancedIsMissing(row[index]))
    );
  } else {
    datasetHeaders.forEach((_, columnIndex) => {
      const missingIndexes = [];
      updated.forEach((row, rowIndex) => {
        if (advancedIsMissing(row[columnIndex])) missingIndexes.push(rowIndex);
      });
      if (!missingIndexes.length) return;

      const values = updated
        .map(row => row[columnIndex])
        .filter(value => !advancedIsMissing(value));

      let replacement = "";

      if (strategy === "mean" || strategy === "median") {
        if (!advancedIsNumericColumn(updated, columnIndex)) return;
        const numericValues = values.map(Number);
        replacement = strategy === "mean"
          ? mean(numericValues)
          : median(numericValues);
        replacement = String(replacement);
      } else if (strategy === "mode") {
        replacement = advancedMode(values);
      }

      if (replacement !== "") {
        missingIndexes.forEach(rowIndex => {
          updated[rowIndex][columnIndex] = replacement;
        });
      }
    });
  }

  advancedWorkingRows = updated;
  const after = advancedQuality(updated).missing;
  advancedAnalyze();

  advancedMessage(
    "Missing value treatment completed. Strategy: " +
    strategy.toUpperCase() + ". Missing cells before: " + before +
    ". Missing cells after: " + after + "."
  );
}

function advancedRemoveDuplicates() {
  const rows = advancedGetRows();
  const before = rows.length;
  const seen = new Set();

  advancedWorkingRows = rows.filter(row => {
    const key = JSON.stringify(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const removed = before - advancedWorkingRows.length;
  advancedAnalyze();
  advancedMessage(
    "Duplicate removal completed. Removed " + removed +
    " duplicate row(s). Remaining rows: " + advancedWorkingRows.length + "."
  );
}

function advancedGenerateReport() {
  const rows = advancedGetRows();
  const quality = advancedQuality(rows);

  const columnRows = datasetHeaders.map((header, index) => {
    const values = rows.map(row => row[index]);
    const nonMissing = values.filter(value => !advancedIsMissing(value));
    const missing = values.length - nonMissing.length;
    const numeric = advancedIsNumericColumn(rows, index);
    const unique = new Set(nonMissing.map(String)).size;

    let numericSummary = "";
    if (numeric && nonMissing.length) {
      const nums = nonMissing.map(Number);
      numericSummary = " | Mean: " + format(mean(nums)) +
        " | Min: " + format(Math.min(...nums)) +
        " | Max: " + format(Math.max(...nums));
    }

    return `<tr>
      <td>${escapeHTML(header)}</td>
      <td>${numeric ? "Numeric" : "Text / Categorical"}</td>
      <td>${nonMissing.length}</td>
      <td>${missing}</td>
      <td>${unique}</td>
      <td>${escapeHTML(numericSummary)}</td>
    </tr>`;
  }).join("");

  $("advancedReport").innerHTML = `
    <h4>Advanced Dataset Quality Report</h4>
    <p><strong>Quality Score:</strong> ${quality.score.toFixed(2)}/100</p>
    <p><strong>Rows:</strong> ${rows.length} &nbsp; | &nbsp;
       <strong>Columns:</strong> ${datasetHeaders.length}</p>
    <p><strong>Missing cells:</strong> ${quality.missing} &nbsp; | &nbsp;
       <strong>Duplicate rows:</strong> ${quality.duplicates} &nbsp; | &nbsp;
       <strong>Completeness:</strong> ${quality.completeness}%</p>
    <table>
      <thead><tr>
        <th>Column</th><th>Type</th><th>Non-empty</th>
        <th>Missing</th><th>Unique</th><th>Numeric summary</th>
      </tr></thead>
      <tbody>${columnRows}</tbody>
    </table>
    <p>Score formula: 70% completeness + 30% duplicate-free rate.</p>
  `;
}

function advancedExport() {
  const rows = advancedGetRows();

  const csvCell = value => {
    let text = String(value ?? "");
    // Prefix formula-like values to reduce spreadsheet formula injection.
    if (/^[\s]*[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };

  const csv = [
    datasetHeaders.map(csvCell).join(","),
    ...rows.map(row => datasetHeaders.map((_, index) => csvCell(row[index])).join(","))
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "tasfia-cleaned-dataset.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  advancedMessage("Cleaned CSV export has started.");
}

function advancedReset() {
  requireDataset();
  advancedSourceRows = datasetRows;
  advancedWorkingRows = datasetRows.map(row => [...row]);
  advancedAnalyze();
  advancedMessage("Cleaning changes reset. Original uploaded data restored.");
}

function advancedCanvas(id) {
  const canvas = $(id);
  if (!canvas) return null;

  const width = Math.max(canvas.clientWidth || 300, 250);
  const height = 230;
  const ratio = window.devicePixelRatio || 1;

  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);

  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  return { ctx, width, height };
}

function advancedDrawHistogram() {
  const rows = advancedGetRows();
  const index = datasetHeaders.findIndex((_, i) =>
    advancedIsNumericColumn(rows, i)
  );

  if (index < 0) throw new Error("No numeric column is available for a histogram.");

  const values = rows
    .map(row => row[index])
    .filter(value => !advancedIsMissing(value))
    .map(Number);

  if (!values.length) throw new Error("No numeric values found.");

  const chart = advancedCanvas("advancedHistogram");
  if (!chart) return;
  const { ctx, width, height } = chart;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const binCount = min === max ? 1 : Math.min(10, Math.max(3, Math.ceil(Math.sqrt(values.length))));
  const bins = Array(binCount).fill(0);

  values.forEach(value => {
    const bin = min === max ? 0 : Math.min(
      binCount - 1,
      Math.floor(((value - min) / (max - min)) * binCount)
    );
    bins[bin]++;
  });

  const left = 35, top = 25, bottom = height - 30;
  const plotWidth = width - left - 15;
  const plotHeight = bottom - top;
  const maxCount = Math.max(...bins, 1);
  const slot = plotWidth / binCount;

  ctx.strokeStyle = "#71847b";
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.lineTo(width - 10, bottom);
  ctx.stroke();

  bins.forEach((count, i) => {
    const barHeight = count / maxCount * plotHeight;
    ctx.fillStyle = "#19d6b0";
    ctx.fillRect(left + i * slot + 3, bottom - barHeight, Math.max(1, slot - 6), barHeight);
  });

  ctx.fillStyle = "#9eafa8";
  ctx.font = "10px Inter, sans-serif";
  ctx.fillText(datasetHeaders[index] + " distribution", left, 15);
  ctx.fillText("Min: " + format(min), left, height - 8);
  ctx.fillText("Max: " + format(max), width - 85, height - 8);
}

function advancedDrawHeatmap() {
  const rows = advancedGetRows();
  const columns = datasetHeaders.map((name, index) => ({
    name,
    values: rows.map(row => row[index])
  })).filter(column =>
    column.values.length >= 2 &&
    column.values.every(value => !advancedIsMissing(value) && Number.isFinite(Number(value)))
  ).slice(0, 7);

  if (columns.length < 2) {
    throw new Error("At least two complete numeric columns are required for a correlation heatmap.");
  }

  const chart = advancedCanvas("advancedHeatmap");
  if (!chart) return;
  const { ctx, width, height } = chart;

  const left = 55, top = 18;
  const cell = Math.min((width - left - 8) / columns.length, (height - top - 12) / columns.length);

  columns.forEach((a, i) => {
    columns.forEach((b, j) => {
      let r = 0;
      try {
        r = pearson(a.values.map(Number), b.values.map(Number));
      } catch (_) {
        r = 0;
      }

      const x = left + j * cell;
      const y = top + i * cell;
      const opacity = 0.18 + Math.abs(r) * 0.78;
      ctx.fillStyle = r >= 0
        ? `rgba(25, 214, 176, ${opacity})`
        : `rgba(217, 154, 100, ${opacity})`;
      ctx.fillRect(x, y, Math.max(1, cell - 2), Math.max(1, cell - 2));

      if (cell >= 30) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "9px Inter, sans-serif";
        ctx.fillText(r.toFixed(2), x + 3, y + cell / 2 + 3);
      }
    });
  });

  ctx.fillStyle = "#9eafa8";
  ctx.font = "9px Inter, sans-serif";
  columns.forEach((column, i) => {
    ctx.fillText(column.name.slice(0, 7), 2, top + i * cell + cell / 2 + 3);
    ctx.fillText(column.name.slice(0, 7), left + i * cell, height - 3);
  });
}

function advancedVisualize() {
  advancedDrawHistogram();
  advancedDrawHeatmap();
  advancedMessage("Histogram and correlation heatmap generated from the current cleaned working dataset.");
}

$("advancedAnalyzeBtn")?.addEventListener("click", () => {
  try { advancedAnalyze(); }
  catch (error) { advancedMessage(error.message); }
});

$("applyMissingBtn")?.addEventListener("click", () => {
  try { advancedApplyMissing(); }
  catch (error) { advancedMessage(error.message); }
});

$("removeDuplicatesBtn")?.addEventListener("click", () => {
  try { advancedRemoveDuplicates(); }
  catch (error) { advancedMessage(error.message); }
});

$("advancedReportBtn")?.addEventListener("click", () => {
  try { advancedGenerateReport(); }
  catch (error) { advancedMessage(error.message); }
});

$("advancedExportBtn")?.addEventListener("click", () => {
  try { advancedExport(); }
  catch (error) { advancedMessage(error.message); }
});

$("advancedResetBtn")?.addEventListener("click", () => {
  try { advancedReset(); }
  catch (error) { advancedMessage(error.message); }
});

$("advancedVisualizeBtn")?.addEventListener("click", () => {
  try { advancedVisualize(); }
  catch (error) { advancedMessage(error.message); }
});

/* =========================================
   DATAGUARD INTELLIGENT QUALITY ENGINE
   Connected to the existing Dataset Analyzer
========================================= */

let dgCustomRules = [];
let dgLatestResult = null;

function dgPopulateColumns() {
  const select = $("dgRuleColumn");
  if (!select || !Array.isArray(datasetHeaders) || !datasetHeaders.length) return;
  select.innerHTML = datasetHeaders.map((header, index) =>
    `<option value="${index}">${escapeHTML(header)}</option>`
  ).join("");
}

function dgRenderRules() {
  const container = $("dgRulesList");
  if (!container) return;
  if (!dgCustomRules.length) {
    container.innerHTML = "<p>No custom rules added yet.</p>";
    return;
  }
  container.innerHTML = dgCustomRules.map((rule, index) => `
    <div class="dg-rule-item">
      <span><strong>${escapeHTML(rule.column)}</strong>: ${rule.min === null ? "No minimum" : "Min " + rule.min} | ${rule.max === null ? "No maximum" : "Max " + rule.max}</span>
      <button type="button" data-dg-remove="${index}">Remove</button>
    </div>
  `).join("");
}

function dgDetectOutliers(rows) {
  const results = [];
  datasetHeaders.forEach((header, index) => {
    const values = rows.map(row => row[index])
      .filter(value => !advancedIsMissing(value) && Number.isFinite(Number(value)))
      .map(Number);
    if (values.length < 4) return;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const lowerHalf = sorted.slice(0, middle);
    const upperHalf = sorted.slice(Math.ceil(sorted.length / 2));
    const q1 = median(lowerHalf);
    const q3 = median(upperHalf);
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;
    const outliers = values.filter(value => value < lower || value > upper);
    if (outliers.length) results.push({ column: header, count: outliers.length, values: outliers.slice(0, 8), lower, upper });
  });
  return results;
}

function dgValidateRules(rows) {
  return dgCustomRules.map(rule => {
    const violations = [];
    rows.forEach((row, rowIndex) => {
      const value = row[rule.index];
      if (advancedIsMissing(value)) return;
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue)) {
        violations.push({ row: rowIndex + 1, value, reason: "Not numeric" });
      } else if (rule.min !== null && numericValue < rule.min) {
        violations.push({ row: rowIndex + 1, value, reason: "Below minimum" });
      } else if (rule.max !== null && numericValue > rule.max) {
        violations.push({ row: rowIndex + 1, value, reason: "Above maximum" });
      }
    });
    return { column: rule.column, violations };
  });
}

function dgRunValidation() {
  requireDataset();
  const rows = advancedGetRows();
  if (!rows.length) throw new Error("The working dataset is empty.");

  const quality = advancedQuality(rows);
  const totalCells = rows.length * datasetHeaders.length;
  let totalMissing = 0;
  const missingByColumn = [];

  datasetHeaders.forEach((header, index) => {
    const count = rows.filter(row => advancedIsMissing(row[index])).length;
    totalMissing += count;
    if (count) missingByColumn.push({ column: header, count });
  });

  const seen = new Set();
  let duplicates = 0;
  rows.forEach(row => {
    const key = JSON.stringify(row);
    if (seen.has(key)) duplicates++;
    else seen.add(key);
  });

  const outliers = dgDetectOutliers(rows);
  const rules = dgValidateRules(rows);
  const totalOutliers = outliers.reduce((sum, item) => sum + item.count, 0);
  const totalViolations = rules.reduce((sum, item) => sum + item.violations.length, 0);
  const issueCount = totalMissing + duplicates + totalOutliers + totalViolations;

  dgLatestResult = { rows: rows.length, columns: datasetHeaders.length, quality, totalCells, totalMissing, duplicates, outliers, totalOutliers, rules, totalViolations, issueCount, missingByColumn };

  $("dgScore").textContent = quality.score.toFixed(2);
  $("dgIssues").textContent = issueCount;
  $("dgOutliers").textContent = totalOutliers;
  $("dgViolations").textContent = totalViolations;
  $("dgProgress").style.width = quality.score + "%";
  $("dgScoreLabel").textContent = quality.score + "/100";
  $("dgStatus").textContent = issueCount ? "Issues detected" : "Validation passed";

  let findings = `
    <p><strong>Dataset:</strong> ${rows.length} rows × ${datasetHeaders.length} columns</p>
    <p class="${totalMissing ? "dg-warning" : "dg-good"}">Missing values: <strong>${totalMissing}</strong></p>
    <p class="${duplicates ? "dg-warning" : "dg-good"}">Duplicate rows: <strong>${duplicates}</strong></p>
    <p class="${totalOutliers ? "dg-warning" : "dg-good"}">Outliers: <strong>${totalOutliers}</strong></p>
    <p class="${totalViolations ? "dg-danger" : "dg-good"}">Custom rule violations: <strong>${totalViolations}</strong></p>
  `;
  if (missingByColumn.length) {
    findings += "<h4>Missing Values by Column</h4><ul>" + missingByColumn.map(item => `<li>${escapeHTML(item.column)}: ${item.count}</li>`).join("") + "</ul>";
  }
  if (outliers.length) {
    findings += "<h4>Outlier Details</h4><ul>" + outliers.map(item => `<li>${escapeHTML(item.column)}: ${item.count} unusual value(s)</li>`).join("") + "</ul>";
  }
  if (totalViolations) {
    findings += "<h4>Custom Rule Violations</h4><ul>" + rules.filter(rule => rule.violations.length).map(rule => `<li>${escapeHTML(rule.column)}: ${rule.violations.length} violation(s)</li>`).join("") + "</ul>";
  }
  $("dgFindings").innerHTML = findings;

  const recommendations = [];
  if (totalMissing) recommendations.push("Review missing values and choose an appropriate imputation strategy.");
  if (duplicates) recommendations.push("Inspect duplicate records and remove unnecessary duplicates.");
  if (totalOutliers) recommendations.push("Review unusual numeric values. Outliers may be valid observations, so do not remove them automatically.");
  if (totalViolations) recommendations.push("Review custom rule violations and correct invalid values where appropriate.");
  if (!recommendations.length) recommendations.push("No issues were detected by the current checks. Continue monitoring data quality.");
  $("dgRecommendations").innerHTML = "<ul>" + recommendations.map(item => `<li>${escapeHTML(item)}</li>`).join("") + "</ul>";
  dgGenerateReport();
  return dgLatestResult;
}

function dgGenerateReport() {
  const result = dgLatestResult;
  if (!result) throw new Error("Run validation before generating a report.");
  const status = result.issueCount === 0 ? "No issues detected by current checks" : result.issueCount + " issue(s) detected";
  $("dgFullReport").innerHTML = `
    <h4>DataGuard Quality Assessment</h4>
    <p><strong>Validation Status:</strong> ${status}</p>
    <p><strong>Quality Score:</strong> ${result.quality.score}/100</p>
    <p><strong>Completeness:</strong> ${result.quality.completeness}%</p>
    <p><strong>Total Rows:</strong> ${result.rows}</p>
    <p><strong>Total Columns:</strong> ${result.columns}</p>
    <p><strong>Total Cells:</strong> ${result.totalCells}</p>
    <p><strong>Missing Values:</strong> ${result.totalMissing}</p>
    <p><strong>Duplicate Rows:</strong> ${result.duplicates}</p>
    <p><strong>Detected Outliers:</strong> ${result.totalOutliers}</p>
    <p><strong>Custom Rule Violations:</strong> ${result.totalViolations}</p>
    <p><strong>Report Generated:</strong> ${new Date().toLocaleString()}</p>
    <p class="dg-good">The report describes the current working dataset. The original uploaded dataset remains unchanged.</p>
  `;
}

function dgExportCSV() {
  const rows = advancedGetRows();
  const csvCell = value => {
    let text = String(value ?? "");
    if (/^[\s]*[=+@]/.test(text) || /^-\d/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  const csv = [datasetHeaders.map(csvCell).join(","), ...rows.map(row => datasetHeaders.map((_, index) => csvCell(row[index])).join(","))].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "dataguard-validated-dataset.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$("dgAddRuleBtn")?.addEventListener("click", () => {
  try {
    requireDataset();
    dgPopulateColumns();
    const index = Number($("dgRuleColumn").value);
    if (!Number.isInteger(index) || !datasetHeaders[index]) throw new Error("Please select a valid column.");
    const minText = $("dgMinValue").value.trim();
    const maxText = $("dgMaxValue").value.trim();
    if (minText === "" && maxText === "") throw new Error("Enter at least a minimum or maximum value.");
    const min = minText === "" ? null : Number(minText);
    const max = maxText === "" ? null : Number(maxText);
    if ((min !== null && !Number.isFinite(min)) || (max !== null && !Number.isFinite(max))) throw new Error("Enter valid numeric limits.");
    if (min !== null && max !== null && min > max) throw new Error("Minimum value cannot exceed maximum value.");
    if (dgCustomRules.some(rule => rule.index === index)) throw new Error("A rule already exists for this column. Remove it first.");
    dgCustomRules.push({ index, column: datasetHeaders[index], min, max });
    dgRenderRules();
    $("dgMinValue").value = "";
    $("dgMaxValue").value = "";
    showMessage("dgFindings", "Custom validation rule added. Run validation to check your dataset.");
  } catch (error) {
    showMessage("dgFindings", escapeHTML(error.message));
  }
});

$("dgRulesList")?.addEventListener("click", event => {
  const button = event.target.closest("[data-dg-remove]");
  if (!button) return;
  dgCustomRules.splice(Number(button.dataset.dgRemove), 1);
  dgRenderRules();
  dgLatestResult = null;
  $("dgStatus").textContent = "Rules updated";
});

$("dgRunBtn")?.addEventListener("click", () => {
  try { dgPopulateColumns(); dgRunValidation(); }
  catch (error) { $("dgStatus").textContent = "Validation unavailable"; showMessage("dgFindings", escapeHTML(error.message)); }
});

$("dgReportBtn")?.addEventListener("click", () => {
  try { dgGenerateReport(); }
  catch (error) { showMessage("dgFullReport", escapeHTML(error.message)); }
});

$("dgRefreshBtn")?.addEventListener("click", () => {
  try { dgRunValidation(); }
  catch (error) { showMessage("dgFindings", escapeHTML(error.message)); }
});

$("dgExportBtn")?.addEventListener("click", () => {
  try { dgExportCSV(); }
  catch (error) { showMessage("dgFindings", escapeHTML(error.message)); }
});

$("datasetFile")?.addEventListener("change", () => {
  setTimeout(() => {
    dgCustomRules = [];
    dgLatestResult = null;
    dgPopulateColumns();
    dgRenderRules();
    if ($("dgStatus")) $("dgStatus").textContent = dataset ? "Dataset connected" : "Waiting for dataset";
    ["dgScore", "dgIssues", "dgOutliers", "dgViolations"].forEach(id => { if ($(id)) $(id).textContent = "--"; });
    if ($("dgProgress")) $("dgProgress").style.width = "0%";
    if ($("dgScoreLabel")) $("dgScoreLabel").textContent = "Not analyzed";
  }, 150);
});


/* =========================================
   RESEARCH WORKSPACE - INDEPENDENT MODULE
   Generic academic / thesis project workspace
========================================= */
const rwState = {
  originalRows: [],
  rows: [],
  headers: [],
  fileName: "",
  lastExperiment: null,
  lastEDA: null,
  lastFeatures: null
};

function rwEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}

function rwParseCSV(text) {
  const lines = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      row.push(cell); cell = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some(v => String(v).trim() !== "")) lines.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some(v => String(v).trim() !== "")) lines.push(row);
  if (lines.length < 2) throw new Error("The CSV must contain a header row and at least one data row.");
  const headers = lines[0].map((h, i) => String(h).trim() || `Column_${i + 1}`);
  const rows = lines.slice(1).map(line => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = String(line[i] ?? "").trim(); });
    return obj;
  });
  return { headers, rows };
}

function rwNumericValues(column, rows = rwState.rows) {
  return rows.map(row => row[column]).filter(v => v !== "" && v !== null && v !== undefined && Number.isFinite(Number(v))).map(Number);
}

function rwIsNumeric(column, rows = rwState.rows) {
  const vals = rows.map(r => r[column]).filter(v => v !== "" && v !== null && v !== undefined);
  return vals.length > 0 && vals.filter(v => Number.isFinite(Number(v))).length / vals.length >= 0.8;
}

function rwMode(values) {
  const counts = new Map();
  values.filter(v => v !== "" && v !== null && v !== undefined).forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
  return [...counts.entries()].sort((a,b) => b[1] - a[1])[0]?.[0] ?? "";
}

function rwRefreshStats() {
  const rows = rwState.rows, headers = rwState.headers;
  const missing = rows.reduce((sum, row) => sum + headers.filter(h => row[h] === "" || row[h] === null || row[h] === undefined).length, 0);
  if ($("rwRowsCount")) $("rwRowsCount").textContent = rows.length.toLocaleString();
  if ($("rwColumnsCount")) $("rwColumnsCount").textContent = headers.length.toLocaleString();
  if ($("rwMissingCount")) $("rwMissingCount").textContent = missing.toLocaleString();
  const saved = !!localStorage.getItem("tasfiaResearchProject");
  const completed = [saved, rows.length > 0, !!rwState.lastEDA, !!rwState.lastFeatures, !!rwState.lastExperiment].filter(Boolean).length;
  const progress = Math.round(completed / 5 * 100);
  if ($("rwProgressCount")) $("rwProgressCount").textContent = `${progress}%`;
  if ($("rwProjectStatus")) $("rwProjectStatus").textContent = rows.length ? "Dataset connected" : "Workspace ready";
}

function rwRenderPreview() {
  const wrap = $("rwPreviewWrap");
  if (!wrap) return;
  if (!rwState.rows.length) { wrap.innerHTML = '<div class="rw-empty">Upload a CSV file to see a preview here.</div>'; return; }
  const heads = rwState.headers;
  const sample = rwState.rows.slice(0, 8);
  wrap.innerHTML = `<table class="rw-table"><thead><tr>${heads.map(h => `<th>${rwEscape(h)}</th>`).join("")}</tr></thead><tbody>${sample.map(row => `<tr>${heads.map(h => `<td>${rwEscape(row[h] === "" ? "Missing" : row[h])}</td>`).join("")}</tr>`).join("")}</tbody></table><div class="rw-table-foot">Showing ${sample.length} of ${rwState.rows.length} rows · ${heads.length} columns</div>`;
}

function rwPopulateSelectors() {
  const numeric = rwState.headers.filter(h => rwIsNumeric(h));
  const target = $("rwTarget"), chart = $("rwChartColumn");
  if (target) target.innerHTML = rwState.headers.length ? rwState.headers.map(h => `<option value="${rwEscape(h)}">${rwEscape(h)}</option>`).join("") : '<option value="">Upload a dataset first</option>';
  if (chart) chart.innerHTML = numeric.length ? numeric.map(h => `<option value="${rwEscape(h)}">${rwEscape(h)}</option>`).join("") : '<option value="">No numeric columns found</option>';
}

function rwUploadDataset(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = rwParseCSV(String(reader.result || ""));
      rwState.headers = parsed.headers;
      rwState.originalRows = parsed.rows.map(r => ({...r}));
      rwState.rows = parsed.rows.map(r => ({...r}));
      rwState.fileName = file.name;
      rwState.lastExperiment = rwState.lastEDA = rwState.lastFeatures = null;
      if ($("rwDatasetLabel")) $("rwDatasetLabel").textContent = `${file.name} · ${rwState.rows.length} rows · ${rwState.headers.length} columns`;
      if ($("rwDatasetMessage")) $("rwDatasetMessage").textContent = "Dataset loaded locally. The original upload is preserved for reset.";
      rwRenderPreview(); rwPopulateSelectors(); rwRefreshStats();
      if ($("rwPreprocessMessage")) $("rwPreprocessMessage").textContent = "Dataset ready for preprocessing.";
    } catch (error) {
      if ($("rwDatasetMessage")) $("rwDatasetMessage").textContent = error.message;
    }
  };
  reader.onerror = () => { if ($("rwDatasetMessage")) $("rwDatasetMessage").textContent = "Could not read this file."; };
  reader.readAsText(file);
}

function rwApplyPreprocessing() {
  if (!rwState.rows.length) throw new Error("Upload a CSV dataset first.");
  let rows = rwState.rows.map(r => ({...r}));
  const strategy = $("rwMissingStrategy")?.value || "mean";
  if (strategy === "drop") {
    rows = rows.filter(row => rwState.headers.every(h => row[h] !== "" && row[h] !== null && row[h] !== undefined));
  } else {
    rwState.headers.forEach(h => {
      const present = rows.map(r => r[h]).filter(v => v !== "" && v !== null && v !== undefined);
      const numeric = rwIsNumeric(h, rows);
      let fill = rwMode(present);
      if (numeric) {
        const nums = present.map(Number).filter(Number.isFinite).sort((a,b) => a-b);
        if (nums.length) fill = strategy === "median" ? (nums.length % 2 ? nums[(nums.length-1)/2] : (nums[nums.length/2-1] + nums[nums.length/2])/2) : nums.reduce((a,b)=>a+b,0)/nums.length;
      }
      rows.forEach(r => { if (r[h] === "" || r[h] === null || r[h] === undefined) r[h] = String(fill); });
    });
  }
  const scale = $("rwScaleMethod")?.value || "none";
  if (scale !== "none") rwState.headers.filter(h => rwIsNumeric(h, rows)).forEach(h => {
    const nums = rows.map(r => Number(r[h])).filter(Number.isFinite);
    if (!nums.length) return;
    const avg = nums.reduce((a,b)=>a+b,0)/nums.length;
    const sd = Math.sqrt(nums.reduce((s,n)=>s+(n-avg)**2,0)/nums.length);
    const min = Math.min(...nums), max = Math.max(...nums);
    rows.forEach(r => {
      const n = Number(r[h]);
      if (!Number.isFinite(n)) return;
      r[h] = String(scale === "minmax" ? (max === min ? 0 : (n-min)/(max-min)) : (sd === 0 ? 0 : (n-avg)/sd));
    });
  });
  rwState.rows = rows;
  rwRenderPreview(); rwPopulateSelectors(); rwRefreshStats();
  if ($("rwPreprocessMessage")) $("rwPreprocessMessage").textContent = `Preprocessing applied. Current dataset: ${rows.length} rows. Original upload remains available through Reset.`;
}

function rwRunEDA() {
  if (!rwState.rows.length) throw new Error("Upload a CSV dataset first.");
  const missingByColumn = rwState.headers.map(h => ({name:h, missing:rwState.rows.filter(r => r[h] === "" || r[h] == null).length, type:rwIsNumeric(h) ? "Numeric" : "Categorical / text"}));
  const numeric = rwState.headers.filter(h => rwIsNumeric(h));
  const stats = numeric.map(h => {
    const vals = rwNumericValues(h).sort((a,b)=>a-b);
    const avg = vals.reduce((a,b)=>a+b,0)/vals.length;
    const med = vals.length % 2 ? vals[(vals.length-1)/2] : (vals[vals.length/2-1]+vals[vals.length/2])/2;
    const sd = Math.sqrt(vals.reduce((s,n)=>s+(n-avg)**2,0)/vals.length);
    return {h, count:vals.length, mean:avg, median:med, sd, min:vals[0], max:vals[vals.length-1]};
  });
  const duplicateCount = rwState.rows.length - new Set(rwState.rows.map(r => JSON.stringify(rwState.headers.map(h=>r[h])))).size;
  const out = `<div class="rw-summary-line"><span>Rows <b>${rwState.rows.length}</b></span><span>Columns <b>${rwState.headers.length}</b></span><span>Numeric columns <b>${numeric.length}</b></span><span>Duplicate rows <b>${duplicateCount}</b></span></div><h4 class="rw-table-title">Numeric descriptive statistics</h4>${stats.length ? `<table class="rw-table"><thead><tr><th>Variable</th><th>Count</th><th>Mean</th><th>Median</th><th>Std. dev.</th><th>Min</th><th>Max</th></tr></thead><tbody>${stats.map(s=>`<tr><td>${rwEscape(s.h)}</td><td>${s.count}</td><td>${s.mean.toFixed(4)}</td><td>${s.median.toFixed(4)}</td><td>${s.sd.toFixed(4)}</td><td>${s.min}</td><td>${s.max}</td></tr>`).join("")}</tbody></table>` : '<div class="rw-empty">No numeric columns detected.</div>'}<h4 class="rw-table-title">Column profile</h4><table class="rw-table"><thead><tr><th>Column</th><th>Detected type</th><th>Missing values</th><th>Unique values</th></tr></thead><tbody>${missingByColumn.map(c=>`<tr><td>${rwEscape(c.name)}</td><td>${c.type}</td><td>${c.missing}</td><td>${new Set(rwState.rows.map(r=>r[c.name])).size}</td></tr>`).join("")}</tbody></table>`;
  $("rwEDAOutput").innerHTML = out;
  rwState.lastEDA = {rows:rwState.rows.length, columns:rwState.headers.length, duplicateCount, stats};
  rwRefreshStats();
}

function rwRunFeatureSelection() {
  if (!rwState.rows.length) throw new Error("Upload a CSV dataset first.");
  const scores = rwState.headers.filter(h=>rwIsNumeric(h)).map(h=>{
    const v=rwNumericValues(h), avg=v.reduce((a,b)=>a+b,0)/v.length;
    return {name:h, variance:v.reduce((s,n)=>s+(n-avg)**2,0)/v.length, unique:new Set(v).size};
  }).sort((a,b)=>b.variance-a.variance);
  $("rwFeatureOutput").innerHTML = scores.length ? `<table class="rw-table"><thead><tr><th>Rank</th><th>Feature</th><th>Variance score</th><th>Unique values</th></tr></thead><tbody>${scores.map((s,i)=>`<tr><td>${i+1}</td><td>${rwEscape(s.name)}</td><td>${s.variance.toFixed(6)}</td><td>${s.unique}</td></tr>`).join("")}</tbody></table><p class="rw-note">Higher variance means the feature has more spread. Check data leakage, relevance and statistical assumptions before final selection.</p>` : '<div class="rw-empty">No numeric features available for variance ranking.</div>';
  rwState.lastFeatures=scores; rwRefreshStats();
}

function rwPrepareExperiment() {
  if (!rwState.rows.length) throw new Error("Upload a CSV dataset first.");
  const target=$("rwTarget")?.value;
  if (!target || !rwState.headers.includes(target)) throw new Error("Select a target variable first.");
  const testPct=Number($("rwTestSize")?.value || 25), testCount=Math.max(1,Math.ceil(rwState.rows.length*testPct/100));
  const model=$("rwModelName")?.value || "Custom model", type=$("rwModelType")?.value || "classification";
  const features=rwState.headers.filter(h=>h!==target);
  const result={target,model,type,testPct,trainCount:Math.max(0,rwState.rows.length-testCount),testCount,features};
  rwState.lastExperiment=result;
  $("rwModelOutput").innerHTML=`<strong>Experiment prepared</strong><ul><li>Model / architecture: ${rwEscape(model)}</li><li>Experiment type: ${rwEscape(type)}</li><li>Target: ${rwEscape(target)}</li><li>Candidate input features: ${features.length}</li><li>Training rows: ${result.trainCount}</li><li>Testing rows: ${result.testCount}</li></ul><p>This is a reproducible experiment setup only. No model was trained in the browser. Connect a Python backend to execute ${type === "dl-plan" ? "deep-learning" : "machine-learning"} training.</p>`;
  if ($("rwModelMessage")) $("rwModelMessage").textContent="Experiment configuration saved in this session.";
  rwRefreshStats();
}

function rwEvaluate() {
  const actual=($("rwActual")?.value || "").split(",").map(s=>s.trim()).filter(Boolean);
  const predicted=($("rwPredicted")?.value || "").split(",").map(s=>s.trim()).filter(Boolean);
  if (!actual.length || actual.length!==predicted.length) throw new Error("Enter the same number of actual and predicted values.");
  const numeric=actual.every(v=>Number.isFinite(Number(v))) && predicted.every(v=>Number.isFinite(Number(v)));
  let html="";
  if (numeric) {
    const a=actual.map(Number), p=predicted.map(Number), n=a.length;
    const mae=a.reduce((s,v,i)=>s+Math.abs(v-p[i]),0)/n;
    const mse=a.reduce((s,v,i)=>s+(v-p[i])**2,0)/n;
    const rmse=Math.sqrt(mse), avg=a.reduce((s,v)=>s+v,0)/n;
    const ssTot=a.reduce((s,v)=>s+(v-avg)**2,0), ssRes=a.reduce((s,v,i)=>s+(v-p[i])**2,0);
    const r2=ssTot===0?NaN:1-ssRes/ssTot;
    html=`<div class="rw-summary-line"><span>MAE <b>${mae.toFixed(5)}</b></span><span>MSE <b>${mse.toFixed(5)}</b></span><span>RMSE <b>${rmse.toFixed(5)}</b></span><span>R² <b>${Number.isFinite(r2)?r2.toFixed(5):"Undefined"}</b></span></div>`;
  } else {
    const correct=actual.filter((v,i)=>v===predicted[i]).length, accuracy=correct/actual.length;
    const labels=[...new Set(actual)];
    const rows=labels.map(label=>{const tp=actual.filter((v,i)=>v===label&&predicted[i]===label).length;const fp=actual.filter((v,i)=>v!==label&&predicted[i]===label).length;const fn=actual.filter((v,i)=>v===label&&predicted[i]!==label).length;const precision=tp+fp?tp/(tp+fp):0;const recall=tp+fn?tp/(tp+fn):0;return {label,precision,recall,f1:precision+recall?2*precision*recall/(precision+recall):0};});
    html=`<div class="rw-summary-line"><span>Accuracy <b>${(accuracy*100).toFixed(2)}%</b></span><span>Correct <b>${correct}/${actual.length}</b></span></div><table class="rw-table"><thead><tr><th>Class</th><th>Precision</th><th>Recall</th><th>F1-score</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${rwEscape(r.label)}</td><td>${r.precision.toFixed(4)}</td><td>${r.recall.toFixed(4)}</td><td>${r.f1.toFixed(4)}</td></tr>`).join("")}</tbody></table>`;
  }
  $("rwEvaluationOutput").innerHTML=html;
}

function rwCorrelation(x,y) {
  const n=Math.min(x.length,y.length); if(n<2)return 0;
  const ax=x.slice(0,n), by=y.slice(0,n), mx=ax.reduce((a,b)=>a+b,0)/n, my=by.reduce((a,b)=>a+b,0)/n;
  const num=ax.reduce((s,v,i)=>s+(v-mx)*(by[i]-my),0), dx=Math.sqrt(ax.reduce((s,v)=>s+(v-mx)**2,0)), dy=Math.sqrt(by.reduce((s,v)=>s+(v-my)**2,0));
  return dx&&dy?num/(dx*dy):0;
}

function rwExplain() {
  if(!rwState.rows.length) throw new Error("Upload a CSV dataset first.");
  const target=$("rwTarget")?.value;
  const rows=rwState.headers.filter(h=>h!==target&&rwIsNumeric(h)).map(h=>{
    const vals=rwNumericValues(h), avg=vals.reduce((a,b)=>a+b,0)/vals.length, variance=vals.reduce((s,n)=>s+(n-avg)**2,0)/vals.length;
    let corr="Not available";
    if(target&&rwIsNumeric(target)){const pairs=rwState.rows.filter(r=>r[h]!==""&&r[target]!=="");corr=rwCorrelation(pairs.map(r=>Number(r[h])),pairs.map(r=>Number(r[target]))).toFixed(4);}
    return {h,variance,corr};
  }).sort((a,b)=>b.variance-a.variance);
  $("rwExplainOutput").innerHTML=rows.length?`<table class="rw-table"><thead><tr><th>Feature</th><th>Variance</th><th>Correlation with target</th><th>Interpretation</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${rwEscape(r.h)}</td><td>${r.variance.toFixed(5)}</td><td>${r.corr}</td><td>${r.corr==="Not available"?"Descriptive spread only":`Linear association: ${Number(r.corr)>=0?"positive":"negative"}`}</td></tr>`).join("")}</tbody></table><p class="rw-note">Correlation describes association only; it does not prove causation or provide model-level feature attribution.</p>`:'<div class="rw-empty">No numeric input features available.</div>';
}

function rwDrawChart() {
  if(!rwState.rows.length) throw new Error("Upload a CSV dataset first.");
  const col=$("rwChartColumn")?.value, canvas=$("rwChartCanvas"), ctx=canvas?.getContext("2d");
  if(!col||!ctx) throw new Error("Choose a numeric variable first.");
  const values=rwNumericValues(col); if(!values.length) throw new Error("The selected variable has no numeric values.");
  const w=canvas.width,h=canvas.height,pad=42; ctx.clearRect(0,0,w,h); ctx.fillStyle="#111a17";ctx.fillRect(0,0,w,h);ctx.strokeStyle="#34463e";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad,15);ctx.lineTo(pad,h-pad);ctx.lineTo(w-12,h-pad);ctx.stroke();ctx.fillStyle="#c6d4cd";ctx.font="13px Inter, sans-serif";ctx.fillText(col,pad,22);
  const type=$("rwChartType")?.value;
  if(type==="bar"){
    const data=values.slice(0,20), max=Math.max(...data,1), gap=6, bw=(w-pad-25)/data.length-gap;
    data.forEach((v,i)=>{const bh=(h-pad-65)*(v/max);ctx.fillStyle="#19d6b0";ctx.fillRect(pad+8+i*(bw+gap),h-pad-bh,bw,bh);});
  }else{
    const min=Math.min(...values),max=Math.max(...values),bins=10,counts=Array(bins).fill(0);
    values.forEach(v=>{const idx=max===min?0:Math.min(bins-1,Math.floor((v-min)/(max-min)*bins));counts[idx]++;});
    const top=Math.max(...counts,1),gap=5,bw=(w-pad-25)/bins-gap;
    counts.forEach((v,i)=>{const bh=(h-pad-65)*(v/top);ctx.fillStyle="#19d6b0";ctx.fillRect(pad+8+i*(bw+gap),h-pad-bh,bw,bh);});
  }
  if($("rwChartMessage")) $("rwChartMessage").textContent=`${type==="bar"?"First 20 values":"10-bin distribution"} for ${col} · ${values.length} numeric observations.`;
}

function rwGenerateReport() {
  const title=$("rwTopic")?.value.trim()||"Untitled Research Project", field=$("rwField")?.value.trim()||"Not specified", status=$("rwStatusSelect")?.value||"Planning";
  const objectives=$("rwObjectives")?.value.trim()||"Not provided", notes=$("rwNotes")?.value.trim()||"Not provided";
  const rows=rwState.rows.length, cols=rwState.headers.length, missing=rwState.rows.reduce((s,r)=>s+rwState.headers.filter(h=>r[h]===""||r[h]==null).length,0);
  const exp=rwState.lastExperiment;
  const report=`RESEARCH WORKSPACE REPORT\n========================\n\nProject title: ${title}\nResearch field: ${field}\nProject status: ${status}\nGenerated: ${new Date().toLocaleString()}\n\nRESEARCH OBJECTIVES\n${objectives}\n\nRESEARCH NOTES / HYPOTHESIS\n${notes}\n\nDATASET PROFILE\nFile: ${rwState.fileName||"No dataset uploaded"}\nRows: ${rows}\nColumns: ${cols}\nMissing cells: ${missing}\nColumn names: ${rwState.headers.join(", ")||"None"}\n\nPREPROCESSING SETTINGS\nMissing value strategy: ${$("rwMissingStrategy")?.selectedOptions[0]?.textContent||"Not selected"}\nScaling: ${$("rwScaleMethod")?.selectedOptions[0]?.textContent||"Not selected"}\n\nEXPERIMENT CONFIGURATION\n${exp?`Model: ${exp.model}\nType: ${exp.type}\nTarget: ${exp.target}\nTrain rows: ${exp.trainCount}\nTest rows: ${exp.testCount}`:"No experiment configuration prepared."}\n\nANALYSIS CHECKLIST\nEDA generated: ${rwState.lastEDA?"Yes":"No"}\nFeature ranking generated: ${rwState.lastFeatures?"Yes":"No"}\nExperiment prepared: ${exp?"Yes":"No"}\n\nNOTE\nThis report summarizes information entered or processed in the browser-based Research Workspace. Validate all analyses and add methods, references, limitations and results before using it as an academic thesis report.\n`;
  if($("rwReportPreview")) $("rwReportPreview").textContent=report;
  const blob=new Blob([report],{type:"text/plain;charset=utf-8"}), url=URL.createObjectURL(blob), a=document.createElement("a");a.href=url;a.download="research-workspace-report.txt";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  if($("rwReportMessage")) $("rwReportMessage").textContent="Research report generated and downloaded.";
}

function rwSaveProject() {
  const data={topic:$("rwTopic")?.value||"",field:$("rwField")?.value||"",status:$("rwStatusSelect")?.value||"Planning",objectives:$("rwObjectives")?.value||"",notes:$("rwNotes")?.value||""};
  localStorage.setItem("tasfiaResearchProject",JSON.stringify(data));
  if($("rwProjectHeading")) $("rwProjectHeading").textContent=data.topic.trim()||"Your Research Project";
  if($("rwProjectSubheading")) $("rwProjectSubheading").textContent=data.field?`${data.field} · ${data.status}`:"Plan your research, inspect data and document your experiments in one place.";
  if($("rwProjectMessage")) $("rwProjectMessage").textContent="Project details saved successfully in this browser.";
  rwRefreshStats();
}

function rwLoadProject() {
  try {
    const data=JSON.parse(localStorage.getItem("tasfiaResearchProject")||"{}");
    ["Topic","Field","StatusSelect","Objectives","Notes"].forEach((key)=>{const id="rw"+key, prop=({Topic:"topic",Field:"field",StatusSelect:"status",Objectives:"objectives",Notes:"notes"})[key];if($(id)&&data[prop]!==undefined)$(id).value=data[prop];});
    if($("rwProjectHeading")) $("rwProjectHeading").textContent=data.topic||"Your Research Project";
    if($("rwProjectSubheading")) $("rwProjectSubheading").textContent=data.field?`${data.field} · ${data.status||"Planning"}`:"Plan your research, inspect data and document your experiments in one place.";
  } catch (_) {}
}

$("rwDatasetFile")?.addEventListener("change", event => { const file=event.target.files?.[0]; if(file) rwUploadDataset(file); });
$("rwClearDataset")?.addEventListener("click", () => { rwState.originalRows=[];rwState.rows=[];rwState.headers=[];rwState.fileName="";rwState.lastEDA=rwState.lastFeatures=rwState.lastExperiment=null;if($("rwDatasetFile"))$("rwDatasetFile").value="";if($("rwDatasetLabel"))$("rwDatasetLabel").textContent="No research dataset uploaded";rwRenderPreview();rwPopulateSelectors();rwRefreshStats();if($("rwDatasetMessage"))$("rwDatasetMessage").textContent="Research dataset cleared. Other project details remain saved."; });
$("rwApplyPreprocess")?.addEventListener("click",()=>{try{rwApplyPreprocessing();}catch(e){if($("rwPreprocessMessage"))$("rwPreprocessMessage").textContent=e.message;}});
$("rwResetPreprocess")?.addEventListener("click",()=>{if(!rwState.originalRows.length){if($("rwPreprocessMessage"))$("rwPreprocessMessage").textContent="Upload a dataset first.";return;}rwState.rows=rwState.originalRows.map(r=>({...r}));rwRenderPreview();rwPopulateSelectors();rwRefreshStats();if($("rwPreprocessMessage"))$("rwPreprocessMessage").textContent="Restored the original uploaded dataset.";});
$("rwRunEDA")?.addEventListener("click",()=>{try{rwRunEDA();}catch(e){if($("rwEDAMessage"))$("rwEDAMessage").textContent=e.message;}});
$("rwRunFeatures")?.addEventListener("click",()=>{try{rwRunFeatureSelection();}catch(e){if($("rwFeatureOutput"))$("rwFeatureOutput").textContent=e.message;}});
$("rwRunModel")?.addEventListener("click",()=>{try{rwPrepareExperiment();}catch(e){if($("rwModelMessage"))$("rwModelMessage").textContent=e.message;}});
$("rwEvaluate")?.addEventListener("click",()=>{try{rwEvaluate();}catch(e){if($("rwEvaluationOutput"))$("rwEvaluationOutput").textContent=e.message;}});
$("rwRunExplain")?.addEventListener("click",()=>{try{rwExplain();}catch(e){if($("rwExplainOutput"))$("rwExplainOutput").textContent=e.message;}});
$("rwDrawChart")?.addEventListener("click",()=>{try{rwDrawChart();}catch(e){if($("rwChartMessage"))$("rwChartMessage").textContent=e.message;}});
$("rwGenerateReport")?.addEventListener("click",()=>{try{rwGenerateReport();}catch(e){if($("rwReportMessage"))$("rwReportMessage").textContent=e.message;}});
$("rwSaveProject")?.addEventListener("click",rwSaveProject);
document.addEventListener("DOMContentLoaded",()=>{rwLoadProject();rwPopulateSelectors();rwRefreshStats();});
