
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
