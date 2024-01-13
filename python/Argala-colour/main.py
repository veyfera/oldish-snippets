from PIL import Image, ImageDraw

#img = Image.open("test.png")

#needed colors defined
yellow = (255,255,0,255)
green = (0,255,0,255)
red = (255,0,0,255)

romb_coordinates =[	#has coordinates of 12 houses
(120,69),
(59,28),
(20,68),
(62,121),
(18,179),
(65,213),
(122,178),
(181,218),
(217,184),
(175,121),
(216,67),
(174,25)
]


def figure_out_rombs (start_romb:int):	#defines which rombs to color what 
	r_list = []
	r_list.append((romb_coordinates[start_romb-1],yellow))

	r_list.append((romb_coordinates[start_romb-12],green))
	r_list.append((romb_coordinates[start_romb-3],green))
	r_list.append((romb_coordinates[start_romb-10],green))

	r_list.append((romb_coordinates[start_romb-2],red))
	r_list.append((romb_coordinates[start_romb-11],red))
	r_list.append((romb_coordinates[start_romb-4],red))

	return r_list


def color_rombs (houses:list, file_name:str):
	img = Image.open(file_name)
	for i,j in houses:	#loops through positions and colors
		ImageDraw.floodfill(img, i, value=j)	#tells where to fill and with what color
	return img



for i in range(1,13):	#loop generates 12 maps that depend on the needed algorithm, calls them '1.png' to '12.png'
	r_list = figure_out_rombs(i)
	file = color_rombs(r_list, 'trial.png')
	file.save(str(i) + '.png')
