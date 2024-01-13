from selenium import webdriver
from selenium.webdriver.common.by import By

from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import NoSuchElementException

from selenium.webdriver.support.ui import Select

import csv
import time
from random import uniform, sample
from html import unescape

options = webdriver.ChromeOptions()
options.add_argument("start-maximized")
options.add_argument('--disable-blink-features=AutomationControlled')
driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 15)

def bypass_modal():
    try:
        print("waiting for modal")
        wait.until(
                EC.visibility_of_element_located((By.ID, "modalAnchorLink"))
                )
        modal_img = driver.find_element(By.ID, "modalAnchorLink")
        modal_close_btn = driver.find_element(By.CSS_SELECTOR, "#myModal button")

        ActionChains(driver).move_to_element(modal_img).perform()
        time.sleep(uniform(1, 3))   #'reading' modal content
        ActionChains(driver).move_to_element(modal_close_btn).perform()

        modal_close_btn.click()
    except Exception as exception:
        print("no modal")
        print(type(exception))
        pass

def main_script():
    driver.get("http://www.nseindia.com")
    assert "NSE - National Stock Exchange of India Ltd" in driver.title
    bypass_modal()

    market_data_link = driver.find_element(By.ID, "link_2")
    ActionChains(driver).move_to_element(market_data_link).perform()
    wait.until(
            EC.text_to_be_present_in_element((By.CSS_SELECTOR, "[aria-labelledby=link_2]"), "Market Watch")
            )
    pre_open_market_link = driver.find_element(By.LINK_TEXT, "Pre-Open Market")
    #hover on random links
    dropdown = market_data_link.find_element(By.XPATH, "..")
    dropdown_links = dropdown.find_elements(By.TAG_NAME, "a")
    for link in sample(dropdown_links, k=3):
        ActionChains(driver).move_to_element(link).perform()
        time.sleep(uniform(0.5, 1.5))

    ActionChains(driver).move_to_element(pre_open_market_link).perform()
    pre_open_market_link.click()
    assert "Pre-Open Market, Stock Market Watch - NSE India" in driver.title

    wait.until(
            EC.presence_of_element_located((By.ID, "livePreTable"))
            )
    table = driver.find_element(By.ID, "livePreTable")
    rows = table.find_elements(By.TAG_NAME, "tbody tr")
    last_row = table.find_element(By.CSS_SELECTOR, "tbody tr:last-child")
    ActionChains(driver).move_to_element(last_row).perform()

    table_content = []
    for r in rows:
        try:
            name = unescape(r.find_element(By.CSS_SELECTOR, "td:nth-child(2) a").get_attribute('innerHTML'))
            price = r.find_element(By.CSS_SELECTOR, "td:nth-child(7)").get_attribute('innerHTML')
            table_content.append([name, price])
            print(name, price, sep=";")
        #handle last line and other stuff that does not match
        except NoSuchElementException:
            continue

    with open("file.csv", "w", newline="") as csvfile:
        data_writer = csv.writer(csvfile, delimiter=";", quotechar='|', quoting=csv.QUOTE_MINIMAL)
        for row in table_content:
            data_writer.writerow(row)


def secondary_script():
    home_link = driver.find_element(By.ID, "link_0")
    ActionChains(driver).move_to_element(home_link).perform()
    home_link.click()
    assert "NSE - National Stock Exchange of India Ltd" in driver.title
    bypass_modal()

    print("start charts")
    main_chart = driver.find_element(By.CLASS_NAME, "graph-container")
    ActionChains(driver).move_to_element(main_chart).perform()
    nifty_bank_btn = driver.find_element(By.ID, "NIFTY BANK")
    ActionChains(driver).move_to_element(nifty_bank_btn).perform()
    nifty_bank_btn.click()
    time.sleep(uniform(1, 3))

    print("go to view all")
    span = driver.find_element(By.CSS_SELECTOR, "#tab4_gainers_loosers #viewall")
    view_all_link = span.find_element(By.XPATH, "..")
    bellow_link = driver.find_element(By.ID, "corporate-actions2")
    ActionChains(driver).move_to_element(bellow_link).perform()
    time.sleep(uniform(2, 4))
    view_all_link.click()
    assert "Equity Market Watch, Live Nifty & Sensex Charts & News - NSE India" in driver.title

    print("scroll down")
    stock_select = driver.find_element(By.ID, "equitieStockSelect")
    ActionChains(driver).move_to_element(stock_select).perform()
    stock_select.click()
    time.sleep(uniform(1, 3))
    Select(stock_select).select_by_value("NIFTY ALPHA 50")

    ActionChains(driver).move_by_offset(uniform(-10, 20), uniform(15, 40)).perform()
    time.sleep(uniform(2, 4))
    note_after_table = driver.find_element(By.ID, "marketWatchEquityCmsNote")
    ActionChains(driver).move_to_element(note_after_table).perform()


if __name__ == "__main__":
    main_script()
    secondary_script()
    driver.close()

# from selenium import webdriver
# from selenium.webdriver.common.proxy import Proxy, ProxyType

# prox = Proxy()
# prox.proxy_type = ProxyType.MANUAL
# prox.http_proxy = "ip_addr:port"
# prox.socks_proxy = "ip_addr:port"
# prox.ssl_proxy = "ip_addr:port"

# capabilities = webdriver.DesiredCapabilities.CHROME
# prox.add_to_capabilities(capabilities)

# driver = webdriver.Chrome(desired_capabilities=capabilities)
