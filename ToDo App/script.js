const shoppingForm = document.querySelector(".shopping-form");
const filterButtons = document.querySelectorAll(".filter-buttons button");
const clearBtn = document.querySelector(".clear");
// Arama terimini tutacak global değişken
let currentSearchTerm = "";

document.addEventListener("DOMContentLoaded", function () {
  loadItems();
  updateState();

  shoppingForm.addEventListener("submit", handleFormSubmit);

  filterButtons.forEach((button) => {
    button.addEventListener("click", handleFilterSelection);
  });

  clearBtn.addEventListener("click", clear);

  // Kalan zaman her saniye güncellensin
  setInterval(updateRemainingTimes, 1000);
  updateRemainingTimes();
  // Sayfa yenilendiğinde searchInput temizlensin
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  searchInput.value = ""; // input'u temizle

  // Arama butonu tıklama olayını dinle
  searchBtn.addEventListener("click", () => {
    currentSearchTerm = searchInput.value.trim().toLowerCase();
    updateFilteredItems(); // arama sonrası filtreyi güncelle
  });
});

function clear() {
  const accordionContainer = document.getElementById("todoAccordion");
  accordionContainer.innerHTML = "";
  localStorage.removeItem("shoppingItems");
  updateState();
}

function updateState() {
  const accordionContainer = document.getElementById("todoAccordion");
  const hasItems = accordionContainer.children.length > 0;
  document.querySelector(".alert").classList.toggle("d-none", hasItems);
  clearBtn.classList.toggle("d-none", !hasItems);
  document
    .querySelector(".filter-buttons")
    .classList.toggle("d-none", !hasItems);
}

function saveToLS() {
  const accordionItems = document.querySelectorAll(".accordion-item");
  const liste = [];
  accordionItems.forEach((item) => {
    const id = item.getAttribute("data-item-id");
    const name = item.querySelector(".item-name").textContent;
    const category = item.getAttribute("data-category");
    const startDate = item.getAttribute("data-start-date"); // Doğru
    const endDate = item.getAttribute("data-end-date"); // Doğru
    const completed = item.getAttribute("data-completed") === "true";
    const description = item.getAttribute("data-description");

    liste.push({
      id,
      name,
      category,
      startDate,
      endDate,
      completed,
      description,
    });
  });

  localStorage.setItem("shoppingItems", JSON.stringify(liste));
}

function loadItems() {
  const savedItems = JSON.parse(localStorage.getItem("shoppingItems")) || [];
  const accordionContainer = document.getElementById("todoAccordion");
  accordionContainer.innerHTML = "";
  savedItems.forEach((item) => {
    const accordionItem = createAccordionItem(item);
    accordionContainer.appendChild(accordionItem);
  });
}

function addItem(nameInput) {
  const categoryInput = document.getElementById("item_category");
  const startDateInput = document.getElementById("start_date");
  const endDateInput = document.getElementById("end_date");
  const descriptionInput = document.getElementById("item_description");

  const id = generateId();
  const newItem = {
    id: id,
    name: nameInput.value,
    category: categoryInput.value,
    startDate: startDateInput.value,
    endDate: endDateInput.value,
    completed: false,
    description: descriptionInput.value,
  };

  const accordionItem = createAccordionItem(newItem);
  // Verileri data-özniteliklerine yazalım
  accordionItem.setAttribute("data-item-id", newItem.id);
  accordionItem.setAttribute("data-start-date", newItem.startDate);
  accordionItem.setAttribute("data-end-date", newItem.endDate);
  accordionItem.setAttribute("data-category", newItem.category);
  accordionItem.setAttribute("data-completed", newItem.completed);
  accordionItem.setAttribute("data-description", newItem.description);

  const accordionContainer = document.getElementById("todoAccordion");
  accordionContainer.prepend(accordionItem);

  nameInput.value = "";
  categoryInput.value = "";
  startDateInput.value = "";
  endDateInput.value = "";
  descriptionInput.value = "";

  updateFilteredItems();
  saveToLS();
  updateState();
}

function generateId() {
  return Date.now().toString();
}

function handleFormSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById("item_name");
  const categoryInput = document.getElementById("item_category");
  const startDateInput = document.getElementById("start_date");
  const endDateInput = document.getElementById("end_date");

  if (
    nameInput.value.trim() === "" ||
    categoryInput.value.trim() === "" ||
    startDateInput.value.trim() === "" ||
    endDateInput.value.trim() === ""
  ) {
    alert("Lütfen tüm alanları doldurunuz");
    return;
  }

  if (new Date(endDateInput.value) < new Date()) {
    alert("Bitiş tarihi geçerli zamandan önce olamaz!");
    return;
  }

  addItem(nameInput);
}

function toggleCompleted(e) {
  const accordionItem = e.target.closest(".accordion-item");
  const endDate = accordionItem.getAttribute("data-end-date");
  // Süresi dolmuş (ve tamamlanmamış) öğelerde checkbox ile işaretlemeye izin verme
  if (new Date(endDate) < new Date() && e.target.checked === false) {
    e.target.checked = false;
    return;
  }
  const isCompleted = e.target.checked;
  accordionItem.setAttribute("data-completed", isCompleted);
  updateItemBackground(accordionItem, endDate, isCompleted);
  saveToLS();
  // Durum değişikliğinden sonra aktif filtreye göre listeyi güncelle
  updateFilteredItems();
}

function computeRemainingTime(endDate, isCompleted) {
  if (isCompleted) return "Tamamlandı";
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;
  if (diff <= 0) return "Süre doldu";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${days} gün ${hours} saat ${minutes} dakika ${seconds} saniye kaldı`;
}

function createAccordionItem(item) {
  const accordionItem = document.createElement("div");
  accordionItem.classList.add("accordion-item");
  accordionItem.setAttribute("data-item-id", item.id);
  accordionItem.setAttribute("data-start-date", item.startDate);
  accordionItem.setAttribute("data-end-date", item.endDate);
  accordionItem.setAttribute("data-category", item.category);
  accordionItem.setAttribute("data-completed", item.completed);
  accordionItem.setAttribute("data-description", item.description || "");

  const headerId = "heading_" + item.id;
  const collapseId = "collapse_" + item.id;

  // Header oluşturuluyor
  const header = document.createElement("h2");
  header.classList.add("accordion-header");
  header.id = headerId;

  const button = document.createElement("button");
  button.classList.add("accordion-button", "collapsed");
  button.type = "button";
  button.setAttribute("data-bs-toggle", "collapse");
  button.setAttribute("data-bs-target", "#" + collapseId);
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", collapseId);

  // Sol grup: arrow, checkbox, name
  const leftDiv = document.createElement("div");
  leftDiv.classList.add("left-group");
  const arrowIcon = document.createElement("i");
  arrowIcon.className = "bi bi-chevron-down arrow-icon";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("form-check-input");
  checkbox.checked = item.completed;
  checkbox.addEventListener("change", toggleCompleted);
  // Eğer süresi dolmuş ve tamamlanmamışsa checkbox devre dışı
  if (new Date(item.endDate) < new Date() && !item.completed) {
    checkbox.disabled = true;
  }
  const nameSpan = document.createElement("span");
  nameSpan.textContent = item.name;
  nameSpan.classList.add("item-name", "ms-2");
  // Çift tıklamayla güncelleme (name)
  nameSpan.addEventListener("dblclick", (e) => makeEditable(e, "name"));

  leftDiv.appendChild(arrowIcon);
  leftDiv.appendChild(checkbox);
  leftDiv.appendChild(nameSpan);

  // Sağ grup: category, remaining time, delete
  const rightDiv = document.createElement("div");
  rightDiv.classList.add("right-group");
  const categorySpan = document.createElement("span");
  categorySpan.textContent = item.category;
  categorySpan.classList.add("item-category");
  // Çift tıklamayla güncelleme (category)
  categorySpan.addEventListener("dblclick", (e) => makeEditable(e, "category"));

  const remainingSpan = document.createElement("span");
  remainingSpan.textContent = computeRemainingTime(
    item.endDate,
    item.completed
  );
  remainingSpan.classList.add("remaining-time");

  const deleteIcon = document.createElement("i");
  deleteIcon.className = "fs-3 bi bi-x ms-2 delete-icon";
  deleteIcon.addEventListener("click", removeItem);

  rightDiv.appendChild(categorySpan);
  rightDiv.appendChild(remainingSpan);
  rightDiv.appendChild(deleteIcon);

  button.appendChild(leftDiv);
  button.appendChild(rightDiv);
  header.appendChild(button);

  // Aşağıdaki kodu, createAccordionItem fonksiyonunuzda
  // "accordion-body" kısmının başladığı yerden fonksiyon sonuna kadar
  // mevcut kodun yerine ekleyin:

  // Accordion collapse (body)
  const collapseDiv = document.createElement("div");
  collapseDiv.id = collapseId;
  collapseDiv.classList.add("accordion-collapse", "collapse");
  collapseDiv.setAttribute("aria-labelledby", headerId);
  collapseDiv.setAttribute("data-bs-parent", "#todoAccordion");

  const bodyDiv = document.createElement("div");
  bodyDiv.classList.add("accordion-body");

  // Tarih bilgilerini içeren container (sola dayalı)
  const datesFlexContainer = document.createElement("div");
  datesFlexContainer.style.display = "flex";
  datesFlexContainer.style.justifyContent = "flex-start";
  datesFlexContainer.style.gap = "1rem"; // İki tarih kutusu arasında boşluk
  datesFlexContainer.style.marginBottom = "1rem";

  /** -------------------------
   *  BAŞLANGIÇ TARİHİ ALANI
   * ------------------------**/
  const startDateWrapper = document.createElement("div");
  startDateWrapper.style.border = "2px solid grey";
  startDateWrapper.style.borderRadius = "8px";
  startDateWrapper.style.padding = "1rem";
  // Biraz esneyebilsin diye
  startDateWrapper.style.flex = "1";

  // Label
  const startDateLabel = document.createElement("label");
  startDateLabel.textContent = "Başlangıç Tarihi";
  startDateLabel.style.display = "block";
  startDateLabel.style.fontSize = "0.85rem";
  startDateLabel.style.marginBottom = "0.25rem";

  // Değer (içeriği düzenlenebilir)
  const startDateValue = document.createElement("div");
  // Sadece tarih kısmını gösterelim (Örn. "2025-03-30 15:00")
  startDateValue.textContent = item.startDate.replace("T", " ");
  startDateValue.contentEditable = false;
  startDateValue.addEventListener("dblclick", (e) =>
    makeEditable(e, "startDate")
  );

  // Hata mesajı (küçük kırmızı yazı, varsayılan gizli)
  const startDateError = document.createElement("small");
  startDateError.classList.add("text-danger", "d-none");
  startDateError.style.display = "block";
  startDateError.style.marginTop = "0.25rem";
  startDateError.setAttribute("data-error", "startDate");

  startDateWrapper.appendChild(startDateLabel);
  startDateWrapper.appendChild(startDateValue);
  startDateWrapper.appendChild(startDateError);

  /** -------------------------
   *  BİTİŞ TARİHİ ALANI
   * ------------------------**/
  const endDateWrapper = document.createElement("div");
  endDateWrapper.style.border = "2px solid grey";
  endDateWrapper.style.borderRadius = "8px";
  endDateWrapper.style.padding = "1rem";
  endDateWrapper.style.flex = "1";

  const endDateLabel = document.createElement("label");
  endDateLabel.textContent = "Bitiş Tarihi";
  endDateLabel.style.display = "block";
  endDateLabel.style.fontSize = "0.85rem";
  endDateLabel.style.marginBottom = "0.25rem";

  const endDateValue = document.createElement("div");
  endDateValue.textContent = item.endDate.replace("T", " ");
  endDateValue.contentEditable = false;
  endDateValue.addEventListener("dblclick", (e) => makeEditable(e, "endDate"));

  // Hata mesajı
  const endDateError = document.createElement("small");
  endDateError.classList.add("text-danger", "d-none");
  endDateError.style.display = "block";
  endDateError.style.marginTop = "0.25rem";
  endDateError.setAttribute("data-error", "endDate");

  endDateWrapper.appendChild(endDateLabel);
  endDateWrapper.appendChild(endDateValue);
  endDateWrapper.appendChild(endDateError);

  datesFlexContainer.appendChild(startDateWrapper);
  datesFlexContainer.appendChild(endDateWrapper);

  /** -------------------------
   *  AÇIKLAMA ALANI
   * ------------------------**/
  const descriptionElem = document.createElement("div");
  descriptionElem.classList.add("description-info");
  descriptionElem.textContent = item.description || "";
  descriptionElem.style.border = "2px solid grey";
  descriptionElem.style.borderRadius = "8px";
  descriptionElem.style.padding = "1rem";
  // Metin taşmasın, yatay scroll oluşmasın
  descriptionElem.style.whiteSpace = "pre-wrap";
  descriptionElem.style.wordWrap = "break-word";
  descriptionElem.style.overflowY = "auto";
  descriptionElem.style.overflowX = "hidden";
  descriptionElem.style.minHeight = "100px";
  descriptionElem.addEventListener("dblclick", (e) =>
    makeEditable(e, "description")
  );

  // Elemanları accordion-body'ye ekleyin
  bodyDiv.appendChild(datesFlexContainer);
  bodyDiv.appendChild(descriptionElem);

  collapseDiv.appendChild(bodyDiv);
  accordionItem.appendChild(header);
  accordionItem.appendChild(collapseDiv);

  // Referanslar (arka plan güncellemesinde kullanılacak)
  accordionItem.checkbox = checkbox;
  accordionItem.remainingSpan = remainingSpan;
  accordionItem.deleteIcon = deleteIcon;
  accordionItem.accordionButton = button;
  accordionItem.bodyDiv = bodyDiv;

  updateItemBackground(accordionItem, item.endDate, item.completed);

  // Accordion-header'ın dışına yerleştireceğimiz container (yeni yapı)
  const containerDiv = document.createElement("div");
  containerDiv.classList.add("accordion-item-container");
  containerDiv.style.display = "flex";
  containerDiv.style.alignItems = "center";

  // Alarm ikonu oluştur (Accordion-header dışında sağ tarafta)
  const alarmIcon = document.createElement("i");
  alarmIcon.className =
    "bi bi-alarm fs-4 ms-3 alarm-icon border border-4 border-danger align-self-start rounded-4 p-3 pb-2 pt-2";
  alarmIcon.style.cursor = "pointer";
  alarmIcon.setAttribute("data-item-id", item.id);
  alarmIcon.addEventListener("click", openAlarmSetupModal);

  // Yeni dış container'a accordionItem ve alarm ikonunu ekle
  containerDiv.appendChild(accordionItem);
  containerDiv.appendChild(alarmIcon);

  // Daha iyi hizalama için dış container oluşturuyoruz:
  const outerContainer = document.createElement("div");
  outerContainer.classList.add(
    "d-flex",
    "align-items-start",
    "accordion-outer-container"
  );
  outerContainer.appendChild(containerDiv);

  return outerContainer;
}

function updateItemBackground(accordionItem, endDate, isCompleted) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;

  accordionItem.accordionButton.classList.remove(
    "bg-danger",
    "bg-warning",
    "bg-info",
    "bg-success"
  );

  let bgClass = "";
  if (isCompleted) {
    bgClass = "bg-success";
  } else if (diff <= 0) {
    bgClass = "bg-danger";
  } else if (diff <= 24 * 60 * 60 * 1000) {
    bgClass = "bg-warning";
  } else {
    bgClass = "bg-info";
  }

  accordionItem.accordionButton.classList.add(bgClass);

  const bgColors = {
    "bg-danger": "rgba(220,53,69,0.6)",
    "bg-warning": "rgba(255,193,7,0.6)",
    "bg-info": "rgba(13,202,240,0.6)",
    "bg-success": "rgba(25,135,84,0.6)",
  };

  accordionItem.bodyDiv.style.backgroundColor = bgColors[bgClass];

  accordionItem.deleteIcon.style.color = bgClass === "bg-danger" ? "white" : "";

  if (bgClass === "bg-warning") {
    accordionItem.remainingSpan.classList.add("text-danger");
  } else {
    accordionItem.remainingSpan.classList.remove("text-danger");
  }
}

function removeItem(e) {
  // Tıklama accordion açılmasını tetiklememeli
  e.stopPropagation();
  const accordionItem = e.target.closest(".accordion-item");
  accordionItem.parentElement.removeChild(accordionItem);
  saveToLS();
  updateState();
}

function handleFilterSelection(e) {
  filterButtons.forEach((button) => {
    button.classList.add("btn-outline-info");
    button.classList.remove("btn-info");
  });
  e.target.classList.add("btn-info");
  e.target.classList.remove("btn-outline-info");
  filterItems(e.target.getAttribute("item-filter"));
}

function filterItems(filterType) {
  const containers = document.querySelectorAll(".accordion-item-container");
  containers.forEach((container) => {
    const item = container.querySelector(".accordion-item");
    const completed = item.getAttribute("data-completed") === "true";
    const itemName = item.querySelector(".item-name").textContent.toLowerCase();
    const itemCategory = item.getAttribute("data-category").toLowerCase();

    const matchesSearch =
      currentSearchTerm === "" ||
      itemName.includes(currentSearchTerm) ||
      itemCategory.includes(currentSearchTerm);

    let shouldDisplay = false;
    if (filterType === "completed") {
      shouldDisplay = completed && matchesSearch;
    } else if (filterType === "incomplete") {
      shouldDisplay = !completed && matchesSearch;
    } else {
      shouldDisplay = matchesSearch;
    }

    container.style.display = shouldDisplay ? "flex" : "none";
  });
}

function updateFilteredItems() {
  const activeFilter = document.querySelector(".btn-info[item-filter]");
  filterItems(activeFilter.getAttribute("item-filter"));
}

function updateRemainingTimes() {
  const items = document.querySelectorAll(".accordion-item");
  items.forEach((item) => {
    const completed = item.getAttribute("data-completed") === "true";

    // Tarihi doğrudan accordion-body içeriğinden al (kritik değişim!)
    const endDateElem = item.querySelector(
      "[data-error='endDate']"
    ).previousElementSibling;
    const endDateText = endDateElem.textContent.trim().replace(" ", "T");

    // Burada artık attribute değil DOM'dan çekilen içerik kullanılıyor (çok önemli!)
    item.setAttribute("data-end-date", endDateText); // Eski attribute'u da güncelleyelim

    const newRemaining = computeRemainingTime(endDateText, completed);
    item.remainingSpan.textContent = newRemaining;

    const checkbox = item.querySelector("input[type='checkbox']");
    if (new Date(endDateText) < new Date() && !completed) {
      checkbox.disabled = true;
    } else {
      checkbox.disabled = false;
    }

    updateItemBackground(item, endDateText, completed);
  });

  saveToLS(); // interval sonunda her saniye localStorage güncellemesi yapılıyor.
}

function makeEditable(e, field) {
  const target = e.target;
  target.contentEditable = true;
  target.focus();

  let errorElem = null;
  if (field === "startDate" || field === "endDate") {
    errorElem = target.parentElement.querySelector(`[data-error="${field}"]`);
  }

  const finishEditing = (ev) => {
    const newValue = target.textContent.trim();
    target.contentEditable = false;

    const accordionItem = target.closest(".accordion-item");

    if (errorElem) {
      errorElem.classList.add("d-none");
      errorElem.textContent = "";
    }

    if (field === "startDate" || field === "endDate") {
      const regex = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/;
      if (!regex.test(newValue)) {
        if (errorElem) {
          errorElem.classList.remove("d-none");
          errorElem.textContent = "Geçerli format: YYYY-MM-DD HH:MM";
        }
        target.textContent = accordionItem
          .getAttribute(`data-${field}`)
          .replace("T", " ");
        return;
      }

      const newDate = new Date(newValue.replace(" ", "T"));
      if (field === "endDate" && newDate < new Date()) {
        if (errorElem) {
          errorElem.classList.remove("d-none");
          errorElem.textContent = "Bitiş tarihi geçerli zamandan önce olamaz!";
        }
        target.textContent = accordionItem
          .getAttribute("data-end-date")
          .replace("T", " ");
        return;
      }

      const newDateVal = newValue.replace(" ", "T");

      // ✅ Burası kritik: Data attribute'u HEMEN güncelle
      accordionItem.setAttribute(`data-${field}`, newDateVal);

      const isCompleted =
        accordionItem.getAttribute("data-completed") === "true";

      // Header içindeki kalan süreyi hemen güncelle
      accordionItem.remainingSpan.textContent = computeRemainingTime(
        newDateVal,
        isCompleted
      );

      // Arka planı güncelle
      updateItemBackground(accordionItem, newDateVal, isCompleted);

      // LocalStorage'ı hemen güncelle (setTimeout kaldırıldı, doğrudan çağırılıyor!)
      saveToLS();
    } else {
      accordionItem.setAttribute(`data-${field}`, newValue);
      saveToLS();
    }

    target.removeEventListener("blur", finishEditing);
    target.removeEventListener("keydown", keyHandler);
  };

  const keyHandler = (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      finishEditing(ev);
    }
  };

  target.addEventListener("blur", finishEditing);
  target.addEventListener("keydown", keyHandler);
}

// Alarm ayarlamak için global değişkenler
let currentAlarmItemId = null;
const alarmSound = document.getElementById("alarmSound");

// Alarm modal'larını referans al
const alarmSetupModal = new bootstrap.Modal(
  document.getElementById("alarmSetupModal")
);
const alarmRingModal = new bootstrap.Modal(
  document.getElementById("alarmRingModal")
);

// Alarm ayar modalını aç
function openAlarmSetupModal(e) {
  currentAlarmItemId = e.target.getAttribute("data-item-id");
  document.getElementById("alarmHours").value = "";
  document.getElementById("alarmMinutes").value = "";
  alarmSetupModal.show();
}

// Alarm ayarını kaydet
document.getElementById("setAlarmBtn").addEventListener("click", function () {
  const hours = parseInt(document.getElementById("alarmHours").value) || 0;
  const minutes = parseInt(document.getElementById("alarmMinutes").value) || 0;
  const totalMinutes = hours * 60 + minutes;

  if (totalMinutes <= 0) {
    alert("Geçerli bir süre giriniz.");
    return;
  }

  // Alarmı localStorage'a kaydet
  const alarms = JSON.parse(localStorage.getItem("alarms") || "{}");
  alarms[currentAlarmItemId] = totalMinutes; // kalan dakika
  localStorage.setItem("alarms", JSON.stringify(alarms));

  alarmSetupModal.hide();
});

// Her saniye kontrol edip alarm vakti geldi mi diye bakacağız
setInterval(checkAlarms, 1000);

function checkAlarms() {
  const alarms = JSON.parse(localStorage.getItem("alarms") || "{}");
  const items = document.querySelectorAll(".accordion-item");

  items.forEach((item) => {
    const id = item.getAttribute("data-item-id");
    if (!alarms[id]) return;

    const endDate = new Date(item.getAttribute("data-end-date"));
    const now = new Date();
    const diffMinutes = Math.round((endDate - now) / 60000); // kalan dakika

    if (diffMinutes <= alarms[id]) {
      // Alarm çal
      alarmRing(item);
      delete alarms[id]; // Alarmı çaldıktan sonra sil
      localStorage.setItem("alarms", JSON.stringify(alarms));
    }
  });
}

// Alarm çalınca açılacak modal içeriği
function alarmRing(item) {
  const name = item.querySelector(".item-name").textContent;
  const category = item.getAttribute("data-category");
  const remaining = item.querySelector(".remaining-time").textContent;

  document.getElementById("alarmRingContent").innerHTML = `
    <strong>Görev: </strong>${name}<br>
    <strong>Kategori: </strong>${category}<br>
    <strong>Kalan Süre: </strong>${remaining}
  `;

  alarmSound.play();
  alarmRingModal.show();
}

// Alarm kapatma fonksiyonu
function stopAlarm() {
  alarmSound.pause();
  alarmSound.currentTime = 0;
  alarmRingModal.hide();
}

// Alarm kapatma butonlarını dinle
document.getElementById("stopAlarmBtn").addEventListener("click", stopAlarm);
document
  .getElementById("stopAlarmBtnFooter")
  .addEventListener("click", stopAlarm);
