import json
import sys

def read_from_file(book_name="sorted_bg.json"):
    BG = None
    with open(book_name, 'r') as bg_file:
        BG = json.load(bg_file)
    return BG

def main():

    BG = read_from_file()
    chapter_number = int(sys.argv[1])-1
    argument_2 = int(sys.argv[2])

    chapter_number = (17 if chapter_number > 17 else chapter_number)
    chapters = [chapter for chapter in BG.keys()]
    sellected_chapter = BG[chapters[chapter_number]]
    print(chapters[chapter_number], end='\n\n')

    temp_text_number = None
    if argument_2 > int(sellected_chapter[-1]['number'][-3:-1]):
        print('This text does not exist in ', chapters[chapter_number])
        text_number = len(sellected_chapter) - 1
        print(sellected_chapter[text_number])
        return
    elif argument_2 >= len(sellected_chapter):
        temp_text_number = len(sellected_chapter)-1
        print('This text exists in chapter but is not in array range.')
    else:
        temp_text_number = argument_2 - 1

    while str(argument_2) not in sellected_chapter[temp_text_number]['number']:
        temp_text_number -= 1
        print(sellected_chapter[temp_text_number]['number'], argument_2)
        print(str(argument_2) in sellected_chapter[temp_text_number]['number'])
    text_number = temp_text_number
    for text in sellected_chapter[text_number].values():
        print(text, "\n")
    

if __name__ == '__main__':
    if len(sys.argv) == 3:
        main()
    else:
        print("""\
BG Reader

Usage example:
bg-reader <chapter_number> <verse_number>

bg-reader 12 12
        """)

