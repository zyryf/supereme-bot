const puppeteer = require("puppeteer");

// DATA
const purchaseData = {
  category: "jackets",
  product: "asd",
  size: "Large",
  personalData: {
    fullName: "Your name",
    email: "youremail@gmail.com",
    phone: "000 000 000",
    adress1: "Street",
    adress2: "adress2",
    adress3: "adress3",
    city: "Your city",
    postalCode: "00-000",
    country: "PL",
    cardNumber: "1111 2222 3333 4444 5555",
    CVV: "734",
  },
};
const url = `https://www.supremenewyork.com/shop/all/${[
  purchaseData.category,
]}`;

async function configureBrowser(url) {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(url);

  return page;
}

async function selectItem(item, page) {
  const result = await page.evaluate(async (item) => {
    const elements = [...document.querySelectorAll(".name-link")];
    const element = elements.find((element) => element.innerHTML === item);
    if (element) {
      element.click();
      return Promise.resolve("el_positive");
    } else {
      return Promise.resolve("el_error");
    }
  }, item);

  if (result === "el_error") {
    await page.reload();
    selectItem(item, page);
  }
}

async function selectSize(page, size) {
  await page.evaluate((size) => {
    $(`#size option:contains(${size})`)[0].selected = true;
  }, size);
}

async function addToBasket(page) {
  await page.waitForSelector("#add-remove-buttons > input");
  await page.click("#add-remove-buttons > input");
}

async function checkOut(page) {
  await page.waitForSelector("#cart > a.button.checkout", { visible: true });
  await page.click("#cart > a.button.checkout");
}

async function fillForm(page, personalData) {
  const {
    fullName,
    email,
    phone,
    adress1,
    adress2,
    adress3,
    city,
    postalCode,
    country,
    cardNumber,
    CVV,
  } = personalData;
  await page.waitForSelector("#order_billing_name");
  await page.$eval(
    "#order_billing_name",
    (el, fullName) => (el.value = fullName),
    fullName
  );

  await page.waitForSelector("#order_email");
  await page.$eval("#order_email", (el, email) => (el.value = email), email);

  await page.waitForSelector("#order_tel");
  await page.$eval("#order_tel", (el, phone) => (el.value = phone), phone);

  await page.waitForSelector("#bo");
  await page.$eval("#bo", (el, adress1) => (el.value = adress1), adress1);

  await page.waitForSelector("#oba3");
  await page.$eval("#oba3", (el, adress2) => (el.value = adress2), adress2);

  await page.waitForSelector("#order_billing_address_3");
  await page.$eval(
    "#order_billing_address_3",
    (el, adress3) => (el.value = adress3),
    adress3
  );

  await page.waitForSelector("#order_billing_city");
  await page.$eval(
    "#order_billing_city",
    (el, city) => (el.value = city),
    city
  );

  await page.waitForSelector("#order_billing_zip");
  await page.$eval(
    "#order_billing_zip",
    (el, postalCode) => (el.value = postalCode),
    postalCode
  );

  await page.waitForSelector("#order_billing_country");
  await page.select("#order_billing_country", country);

  await page.waitForSelector("#cnb");
  await page.$eval(
    "#cnb",
    (el, cardNumber) => (el.value = cardNumber),
    cardNumber
  );

  await page.waitForSelector("#vval");
  await page.$eval("#vval", (el, CVV) => (el.value = CVV), CVV);

  await page.waitForSelector("#cart-cc > fieldset > p > label > div > ins");
  await page.click("#cart-cc > fieldset > p > label > div > ins");

  await page.waitForSelector("#pay > input");
  await page.click("#pay > input");
}

(async function runBot() {
  const page = await configureBrowser(url);
  selectItem(purchaseData.product, page);
  selectSize(page, purchaseData.size);
  addToBasket(page);
  checkOut(page);
  fillForm(page, purchaseData.personalData);
})();

//   await browser.close();
