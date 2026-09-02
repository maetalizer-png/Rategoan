(function () {
  const logEl = document.getElementById("log");
  const form = document.getElementById("composer");
  const input = document.getElementById("goal");
  const steps = Array.from(document.querySelectorAll(".step"));

  function setStep(name) {
    steps.forEach((el) => el.classList.toggle("on", el.dataset.step === name));
  }

  function line(k, v) {
    const li = document.createElement("li");
    li.innerHTML = '<div class="k"></div><div class="v"></div>';
    li.querySelector(".k").textContent = k;
    li.querySelector(".v").textContent = v;
    logEl.appendChild(li);
    li.scrollIntoView({ block: "end" });
  }

  function plan(goal) {
    const g = goal.trim();
    return [
      "Baca tujuan sekali. Jangan pecah jadi banyak fitur.",
      "Kerjakan hanya yang diminta: " + g,
      "Jangan buka menu samping, kamera, koleksi, atau tema warna.",
      "Tulis satu laporan selesai. Berhenti.",
    ];
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async function run(goal) {
    form.querySelector("button").disabled = true;
    setStep("pahami");
    line("TUJUAN", goal);
    await wait(250);
    setStep("rencana");
    line("RENCANA", plan(goal).map((x, i) => i + 1 + ". " + x).join("\n"));
    await wait(350);
    setStep("kerja");
    line("KERJA", "Alur agent dijalankan di perangkat. Mesin lama (koleksi, sheet, pitutur) tidak dipakai di OS ini.");
    await wait(350);
    setStep("lapor");
    line("LAPOR", "Selesai satu siklus.\nBerikutnya: sambungkan Raget rule-based ke langkah KERJA, tetap satu tujuan per jalan.");
    form.querySelector("button").disabled = false;
    input.value = "";
    input.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const goal = input.value.trim();
    if (!goal) return;
    run(goal);
  });

  line("OS", "Kesempatan OS. Hitam putih. Empat langkah: pahami → rencana → kerja → lapor.");
  setStep("pahami");
})();
