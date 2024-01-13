import requests
from bs4 import BeautifulSoup
import lxml
import os
import concurrent.futures

output_dir = 'result'
site = 'https://your-site.ru'   #for prepending to incomplete links

#headers for authentication
headers = {
    'authority': 'your-site.ru',
    'cache-control': 'max-age=0',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-gpc': '1',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    'accept-language': 'en-US,en;q=0.9',
    'cookie': 'gingerbread cookie',
}

    
def parse_page(url, first_run=False):
    if page_already_exitst(url, first_run):
        return

    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'lxml')

    page_type = identify_page(url)

    if page_type == 'nav-page':
        parse_nav_page(soup, url)
    elif page_type == 'lesson-page':
        parse_lesson_page(soup, url)
    else:
        print('Error with url: ', url)


def parse_nav_page(bs, url):
    lessons = get_lessons(bs)
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        future_to_name = [executor.submit(extract_link_and_parse, lesson) for lesson in lessons]
    write_page_to_file(bs, url)

def get_lessons(bs):
    lessons = []
    #extracts links from first type of list
    lists1 = bs.find_all('ul', 'lesson-list')
    for l in lists1:
        lessons += l.find_all('div', 'link title')
    
    #extracts links from second type of list
    lists2 = bs.find_all('table', 'stream-table')
    for l in lists2:
        lessons += l.select('tr')

    return lessons

def extract_link_and_parse(lesson):
    title, link = get_link_and_title(lesson)
    print(title, link)
    parse_page(link)

def get_link_and_title(bs):
    tmp_link = bs.get('href') or bs.select_one('a').get('href')
    page_type = identify_page(tmp_link)

    if page_type == 'nav-page':
        title = bs.select_one('span').text.strip()
        link = site + tmp_link
        return (title, link)

    elif page_type == 'lesson-page':
        bs.span.decompose()
        title = bs.text.strip()
        link = (site + '/pl' + tmp_link).replace('view/id/', 'view?id=')

    return (title, link)

def write_page_to_file(bs, filename):
    filename = extract_digits(filename) + '.html'
    if not filename in os.listdir(output_dir):
        bs = localise_page(bs)
        with open(f'{output_dir}/{filename}', 'w') as f:
            f.write(str(bs))
    else:
        print('file already there')
    

def parse_lesson_page(bs, url):
    write_page_to_file(bs, url)


def page_already_exitst(url, first_run):
    filename = extract_digits(url) + '.html'
    if not first_run and filename in os.listdir(output_dir):
        print('File already there')
        return True
    return False

def identify_page(url):
    print('identifying url: ',url)
    if is_a_nav_page(url):
        return 'nav-page'
    elif is_a_lesson_page(url):
        return 'lesson-page'
    else:
        write_error_to_log(url)
        return 'error'

def is_a_nav_page(url):
    if 'stream' in url:
        return True
    return False

def is_a_lesson_page(url):
    if 'lesson' in url:
        return True
    return False

def localise_page(bs):
    #links all hyperlinks to local files
    for a in bs.find_all('a'):
        try:
            tmp = a['href']
            tmp = extract_digits(tmp) + '.html'
            a['href'] = tmp
        except KeyError:
            pass
    return bs
    
def extract_digits(original_string):
    new_string = ''.join(filter(str.isdigit, original_string))
    return new_string
    


if __name__ == '__main__':  
    if not output_dir in os.listdir():
        os.mkdir(output_dir)
        
    start_url = 'https://your-site.ru/teach/control/stream/view/id/123456789'
    parse_page(start_url, first_run=True)

