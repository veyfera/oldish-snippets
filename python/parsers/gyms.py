import requests
from bs4 import BeautifulSoup
import lxml

GYMS = []
csv_columns = ['name', 'address', 'coord', 'city']

def get_gym_site():
	site = 'https://sportgyms.ru/'

	page = requests.get(site)
	soup = BeautifulSoup(page.text, 'lxml')
	cities = soup.select('.alphaList a')

	for i in range(len(cities)):

		city_link = cities[i].get('href')
		if 'https' not in city_link:
			city_link = 'https://sportgyms.ru' + city_link

		city_page = requests.get(city_link)
		city_soup = BeautifulSoup(city_page.text, 'lxml')

		sub_pages = city_soup.select('.navigation a')
		if sub_pages:
			print(city_link)
			get_gyms(city_link)
			for p in sub_pages:
				print(p.get('href'))

				get_gyms(p.get('href'))
			print('\n')
		else:
			print('no paginatino for ', city_link)

def get_gyms(url):
	page = requests.get(url)
	soup = BeautifulSoup(page.text, 'lxml')

	gyms = soup.select('.clubWrap')
	for g in gyms:
		gym_link = g.select_one('a').get('href')
		print(gym_link)
		get_gym(gym_link)


def get_gym(url):
	page = requests.get(url)
	soup = BeautifulSoup(page.text, 'lxml')
	gym_obj = {}

	name = soup.select_one('h1')
	gym_obj['name'] = name.text

	city = soup.select_one('.ciCities a').text
	gym_obj['city'] = city

	try:
		coord = soup.select_one('.ciAdress a').get('data-geo')
		gym_obj['coord'] = coord
	except:
		gym_obj['coord'] = ''

	address = soup.find('div', class_='ciAdress')#.strong.decompose()
	address.strong.decompose()
	try:
		address.a.decompose()
	except:
		address = address
	address = address.text.strip()
	gym_obj['address'] = address

	GYMS.append(gym_obj)
	print(GYMS[-1], '\n')

def write_csv(csvFileName, csvFieldNames,  row=None ):

    import csv
    import os 
    if row:
        if os.path.exists(csvFileName):

            f_handle = open(csvFileName, 'a')
            csvWriter = csv.DictWriter(f_handle, fieldnames=csvFieldNames)
        else:

            f_handle =  open(csvFileName, 'w+')
            csvWriter = csv.DictWriter(f_handle, fieldnames=csvFieldNames)
            csvWriter.writeheader()
        try:
            csvWriter.writerow(row)
        finally:
            f_handle.close()

if __name__ == '__main__':
	get_gym_site()

	for row in GYMS:
	    write_csv(csvFileName="gyms.csv",csvFieldNames=csv_columns,row=row)