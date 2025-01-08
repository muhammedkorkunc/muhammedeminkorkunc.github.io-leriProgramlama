const listColumns = document.querySelectorAll(".drag-item-list"); //class=drag-item-list olan tüm elementleri getirir querySelectorAll

// id=todo-list olan TODO sütununda ki verileri getiriyor
const todoList = document.getElementById("todo-list"); //id=todo-list olan "ul" elementi getirir
const progressList = document.getElementById("progress-list");
const doneList = document.getElementById("done-list");

const addButtons = document.querySelectorAll(".add-btn:not(.update)"); // + butonlarının hepsini seçer getirir
const saveButtons = document.querySelectorAll(".update"); // kaydet butonlarını getirir
const addItemContainers = document.querySelectorAll(".add-container"); // container yani yazı yazma alanını getirir
const addItems = document.querySelectorAll(".add-item"); // yazı yazma alanınına izin vermek için

//Local storage 'a verileri kayfetmek için dizi oluşturdum
let todoListArray = [];
let progressListArray = [];
let doneListArray = [];
let listArrays = [];

let draggedItem; //sürüklenen eleman
let currentColumn;
let dragging = false;

let updatedOnLoad = false; //local storage'dan verileri çekilmedi(false) başlangıç durumu

//Local Storage'dan verilerin çekilmesi
function getSavedColumns() {
  if (localStorage.getItem("todoItems")) {
    //local storage'da todoItems var mı? daha önce kaydedilmiş veri var mı?
    //listArrays = [todoListArray, progressListArray, doneListArray]; burda üçünü aynı anda kaydettiğim için biri varsa diğerleri de vardır.
    todoListArray = JSON.parse(localStorage.getItem("todoItems"));
    //JSON.parse ile local storage da tutulan json objesini javascript objesine çevirdim
    progressListArray = JSON.parse(localStorage.getItem("progressItems"));
    doneListArray = JSON.parse(localStorage.getItem("doneItems"));
  } else {
    //local storage'da veriler yoksa default verileri atadım
    todoListArray = ["React Entegrasyonu", "Angular Entegrasyonu"];
    progressListArray = ["Sendgrid Entegrasyonu"];
    doneListArray = ["Verimor Entegrasyonu"];
  }
}

//Local Storage'a verilerin kaydedilmesi
function updateSavedColumns() {
  listArrays = [todoListArray, progressListArray, doneListArray];
  const arrayNames = ["todo", "progress", "done"];
  arrayNames.forEach((arrayName, index) => {
    localStorage.setItem(
      `${arrayName}Items`, // "todoItems, progressItems, doneItems"
      JSON.stringify(listArrays[index]) //javascript objesini json'a çevirir
    );

    //index= 0 ken todo-Item = todoListArray = listArrays[0]
    //index= 1 ken progress-Item = progressListArray = listArrays[1]
    //index= 2 ken done-Item = doneListArray = listArrays[2]
  });
}

//localstroage'da ki verileri tarayıcıda bastım yani DOM güncelledim
function createItem(columnItem, column, item, index) {
  //li etiketi oluşturma fonksiyonu
  //columnItem=todoList , column=0, item=React Entegrasyonu, index=0

  //local storage' dan gelen verileri görme
  //   console.log('columnItem', columnItem);
  //   console.log('column', column);
  //   console.log('item', item);
  //   console.log('index', index);

  const listItem = document.createElement("li"); //li elementi oluşturuldu
  listItem.classList.add("drag-item"); //li elementine class eklendi
  listItem.textContent = item; //item değeri localstroage içinde kayıtlı olan veridir.
  //böylece her item için li elementi oluşturulmuş oldu
  listItem.draggable = true; //create ettiğimiz li elementi sürüklenebilir hale getirildi draggable
  listItem.contentEditable = true; //li elementi içeriği değiştirilebilir hale getirildi contentEditable
  listItem.setAttribute("onfocusout", `updateItem(${index},${column})`); //onfocusout metotu(updateItem) tetikler
  listItem.setAttribute("ondragstart", "drag(event)"); //sürüklenen elemanın hangisi olduğunu belirtir (ondragstart drag metotunu tetikler)
  columnItem.appendChild(listItem); //li elementi todoList'e eklendi yani ekrana yazıldı
}

function updateItem(id, column) {
  const selectedArray = listArrays[column]; //seçilen kolonun içindeki array
  const selectedColumn = listColumns[column].children;

  console.log(selectedArray);

  if (!dragging) {
    //yazı yazma işi bittiyse sürükle bırak izin verir
    if (!selectedColumn[id].textContent) {
      //eğer içeriği boş ise
      delete selectedArray[id]; //local storage dan siler seçilen elemanı
    } else {
      selectedArray[id] = selectedColumn[id].textContent;
    }
    updateDOM();
  }
}

function allowDrop(e) {
  //sürüklenen elemanın(even=e) default olarak drop edilemez özelliğini engelledim
  e.preventDefault();
}
function dragEnter(column) {
  //   console.log(listColumns[column]);
  listColumns[column].classList.add("over"); //sürüklenen elemanın sürüklendiği kolonlarda yer açar
  currentColumn = column;
}

function updateInsideArrays() {
  //ilk array'leri güncelledim
  todoListArray = []; //üstüne yazmamak için boşalttım
  for (let i = 0; i < todoList.children.length; i++) {
    //"todoList.children.length = yani todo içinde kalan eleman sayısı
    todoListArray.push(todoList.children[i].textContent); //ekrandaki verileri alıp todoListArray i güncelledim
  }
  progressListArray = [];
  for (let i = 0; i < progressList.children.length; i++) {
    progressListArray.push(progressList.children[i].textContent);
  }
  doneListArray = [];
  for (let i = 0; i < doneList.children.length; i++) {
    doneListArray.push(doneList.children[i].textContent);
  }
  //sonra local storage verilerini güncelledim
  updateDOM();
}

function drop(e) {
  //bırakma işlemi
  e.preventDefault(); //elemanı nereye taşıyacaksak orası için de drop(taşınamaz) edilemez default özelliğini engelledim
  const parent = listColumns[currentColumn]; //şuan sürüklenen elemanın sürüklendiği kolonu

  listColumns.forEach((column) => {
    column.classList.remove("over"); //sürükleme yapılırken açılan yeri işlem bitince kaldırdım
  });
  parent.appendChild(draggedItem); // şuan sürüklenen elemanı parent'a ekledim appendChild ile
  dragging = false;
  updateInsideArrays(); //sürüklenen elemanla işimiz bittikten sonra local storage'da verileri güncelledim
}

function drag(e) {
  draggedItem = e.target; //e=event, sürüklenen eleman= e.target- yani sürüklenen elemanı draggedItem'a atadım
  console.log(draggedItem);
  dragging = true;
}

function filterArray(array) {
  const filteredArray = array.filter((item) => item !== null);
  return filteredArray;
}

function updateDOM() {
  //ekrandaki görünen verileri güncellemek için
  if (!updatedOnLoad) {
    getSavedColumns();
  }

  todoList.textContent = ""; //"todoList içindeki tüm elemanları sildim
  todoListArray.forEach((todoItem, index) => {
    createItem(todoList, 0, todoItem, index); //"todoItem = todoList içindeki tüm elemanları temsil eder todoItem0,todoItem1,todoItem2
  });
  todoListArray = filterArray(todoListArray); //silinen bol elemandan kalan yeri filter yapıcaz

  progressList.textContent = "";
  progressListArray.forEach((progressItem, index) => {
    createItem(progressList, 1, progressItem, index);
  });
  progressListArray = filterArray(progressListArray);

  doneList.textContent = "";
  doneListArray.forEach((doneItem, index) => {
    createItem(doneList, 2, doneItem, index);
  });
  doneListArray = filterArray(doneListArray);

  updatedOnLoad = true;
  updateSavedColumns(); //local storage'a verileri kaydettim
}

function showItemDiv(column) {
  //+ butonuna tıklandığında
  addButtons[column].style.visibility = "hidden"; // O kolondaki + butonunu tıklandıktan sonra gizledim
  addItemContainers[column].style.display = "flex"; //+ ya tıklanan kolonun yazı yazma alanını gösterdim
  saveButtons[column].style.display = "flex"; //+ ya tıklanan kolonun kaydet butonunu gösterdim
}

function hideItemDiv(column) {
  //kaydet butonuna tıklandığında
  addButtons[column].style.visibility = "visible"; // + görünür
  addItemContainers[column].style.display = "none"; // container gizlenir
  saveButtons[column].style.display = "none"; // kaydet butonu gizlenir
  addToColumn(column); //kaydet butonuna tıklandığında yazı yazma alanındaki veriyi o kolona ekler
}

function addToColumn(column) {
  //kaydet butonuna tıklandığında yazı yazma alanındaki veriyi o kolona ekleyecek fonksiyonum
  // console.log(addItems[column].textContent);
  const itemText = addItems[column].textContent; //yazı yazma alanındaki verinin içeriğini
  const selectedArray = listArrays[column];
  selectedArray.push(itemText); //yazı yazma alanındaki veriyi o kolonun dizine push ettim
  addItems[column].textContent = ""; //yeniden + ya basılınca eski yazdığımı görünmesin diye temizledim
  updateDOM(); //eklenen veriyi ekrana bastı güncelledi local_storage'a kaydetti
}

updateDOM();
