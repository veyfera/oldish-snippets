import requests
from bs4 import BeautifulSoup
import lxml
import os
import concurrent.futures

output_dir = 'result'
site = 'https://www.mi.com/in/list'   #for prepending to incomplete links
    
def write_product_list(products):
    if not filename in os.listdir(output_dir):
        bs = localise_page(bs)
        with open(f'{output_dir}/{filename}', 'w') as f:
            f.write('\n'.join(products))
    else:
        print('file already there')
    

def get_models(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'lxml')
    wrapper = soup.find('div', 'xm-plain-box category-list', id="1")
    items  = wrapper.find_all('li', 'category-list-product')
    links = []
    for item in items:
        tmp = item.findChild('a')['href'] + 'specs'
        links.append(tmp)
    return links

def get_details(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html')

    specs = soup.find('main', "specs")
    print(soup)
    return
    buy_link = soup.find('a', id="nav-buy_now")#['href']
    print(buy_link)
    return

    price = get_price(buy_link)

    return [price, specs]

def get_price(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'lxml')
    price = soup.find('div', "information-section__product-price")
    return price
    


if __name__ == '__main__':  
    start_url = site
    models = get_models(site)
    details = []
    for model in models:
        print('started extracting details for: ', model)
        tmp = get_details(model)
        template = f'<div class="ezik-product"><h4>{0}</h4>{1}</div>'.format(tmp[0], tmp[1])
        details.append(template)
        break
    #get_details(models[0])
    write_product_list(details)

    #with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        #future_to_name = [executor.submit(get_details, model) for model in models]
    #write_product_list(details)

