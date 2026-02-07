const taskList = document.getElementById("task-list");
const taskForm = document.getElementById("task-form");
const taskProgress = document.getElementById("task-progress");
const activeTaskCount = document.getElementById("active-task-count");

const cashflowList = document.getElementById("cashflow-list");
const cashflowForm = document.getElementById("cashflow-form");
const incomeTotal = document.getElementById("income-total");
const expenseTotal = document.getElementById("expense-total");
const netTotal = document.getElementById("net-total");
const cashBalance = document.getElementById("cash-balance");
const cashflowStatus = document.getElementById("cashflow-status");

const tasks = [
  {
    title: "Q4 satış hedefleri raporu",
    assignee: "Finans",
    done: false,
  },
  {
    title: "Yeni marka kit tasarımı",
    assignee: "Tasarım",
    done: true,
  },
  {
    title: "Lojistik sözleşme revizyonu",
    assignee: "Operasyon",
    done: false,
  },
];

const cashflows = [
  { label: "E-ticaret satışları", amount: 84500, type: "income" },
  { label: "Kurumsal proje avansı", amount: 32000, type: "income" },
  { label: "Reklam kampanyası", amount: 18500, type: "expense" },
  { label: "Araç bakım", amount: 6200, type: "expense" },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);

const renderTasks = () => {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "task-item";

    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => {
      tasks[index].done = checkbox.checked;
      renderTasks();
    });

    const text = document.createElement("div");
    const title = document.createElement("span");
    title.textContent = task.title;
    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.textContent = task.assignee;

    text.appendChild(title);
    text.appendChild(meta);

    label.appendChild(checkbox);
    label.appendChild(text);

    const status = document.createElement("span");
    status.className = "badge";
    status.textContent = task.done ? "Tamamlandı" : "Devam";

    wrapper.appendChild(label);
    wrapper.appendChild(status);

    taskList.appendChild(wrapper);
  });

  const completed = tasks.filter((task) => task.done).length;
  const total = tasks.length || 1;
  const progress = Math.round((completed / total) * 100);
  taskProgress.textContent = `${progress}% Tamamlandı`;
  activeTaskCount.textContent = tasks.filter((task) => !task.done).length;
};

const renderCashflows = () => {
  cashflowList.innerHTML = "";
  let income = 0;
  let expense = 0;

  cashflows.forEach((flow) => {
    const wrapper = document.createElement("div");
    wrapper.className = "cashflow-item";

    const label = document.createElement("span");
    label.textContent = flow.label;

    const amount = document.createElement("span");
    amount.className = flow.type;
    amount.textContent =
      (flow.type === "expense" ? "-" : "+") + formatCurrency(flow.amount);

    wrapper.appendChild(label);
    wrapper.appendChild(amount);

    cashflowList.appendChild(wrapper);

    if (flow.type === "income") {
      income += flow.amount;
    } else {
      expense += flow.amount;
    }
  });

  const net = income - expense;
  incomeTotal.textContent = formatCurrency(income);
  expenseTotal.textContent = formatCurrency(expense);
  netTotal.textContent = formatCurrency(net);
  cashBalance.textContent = formatCurrency(net + 42000);

  if (net >= 0) {
    cashflowStatus.textContent = "Pozitif";
    cashflowStatus.style.background = "rgba(18, 183, 106, 0.15)";
    cashflowStatus.style.color = "#027A48";
  } else {
    cashflowStatus.textContent = "Dikkat";
    cashflowStatus.style.background = "rgba(240, 68, 56, 0.15)";
    cashflowStatus.style.color = "#B42318";
  }
};

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(taskForm);
  const taskName = formData.get("task").trim();
  const assignee = formData.get("assignee");

  if (!taskName) return;
  tasks.unshift({ title: taskName, assignee, done: false });
  taskForm.reset();
  renderTasks();
});

cashflowForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(cashflowForm);
  const label = formData.get("label").trim();
  const amount = Number(formData.get("amount"));
  const type = formData.get("type");

  if (!label || Number.isNaN(amount) || amount <= 0) return;
  cashflows.unshift({ label, amount, type });
  cashflowForm.reset();
  renderCashflows();
});

renderTasks();
renderCashflows();
