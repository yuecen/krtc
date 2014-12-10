#!/usr/bin/python
# -*- coding: utf-8 -*-
import argparse
import json
import urllib
import re
import sys
reload(sys)
sys.setdefaultencoding('utf-8')


url = ''
proxy = ''

def file_name(saved_url):
    file_name = re.match(r'(?i).*/(.*)\.pdf$', saved_url)
    assert file_name != None, 'file name can be found.'
    return file_name.group(1)


def download_file(download_url, file_name):
    global proxy
    if proxy:
        web_file = urllib.urlopen(download_url, proxies={'https': proxy})
    else:
        web_file = urllib.urlopen(download_url)
    local_file = open(file_name + '.pdf', 'wb')
    local_file.write(web_file.read())
    web_file.close()
    local_file.close()


def data_extraction(filename):
    from pdfminer.pdfparser import PDFParser, PDFDocument
    from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
    from pdfminer.converter import PDFPageAggregator
    from pdfminer.layout import LAParams, LTTextBoxHorizontal

    doc = PDFDocument()
    parser = PDFParser(open(filename + '.pdf', 'rb'))
    parser.set_document(doc)
    doc.set_parser(parser)
    doc.initialize()

    if not doc.is_extractable:
        raise PDFTextExtractionNotAllowed

    rsrcmgr = PDFResourceManager()
    laparams = LAParams()
    device = PDFPageAggregator(rsrcmgr, laparams=laparams)
    interpreter = PDFPageInterpreter(rsrcmgr, device)

    data_cols = {}
    date, day, red_line_people, orange_line_people, total_people = [], [], [], [], []
    for i, page in enumerate(doc.get_pages()):
        interpreter.process_page(page)
        layout = device.get_result()
        for x in layout:
            if type(x) == LTTextBoxHorizontal:
                x = re.sub(r'\n\s*\n', '\n' , x.get_text()).strip()
                first_value = str(x.split('\n')[0]).strip()
                if first_value == '營運日':
                    date = x.split('\n')
                    # print '營運日', date
                if first_value == '星期':
                    day = x.split('\n')
                    # print '星期', day
                if first_value == '紅線運量(人次)':
                    red_line_people = [v.strip() for v in x.replace(',','').split('\n')]
                    # print '紅線運量(人次)', red_line_people
                if first_value == '橘線運量(人次)':
                    orange_line_people = [v.strip() for v in x.replace(',','').split('\n')]
                    # print '橘線運量(人次)', orange_line_people
                if first_value == '總運量(人次)':
                    total_people = [v.strip() for v in x.replace(',','').split('\n')]
                    # print '總運量(人次)', total_people
    data_cols = {'date': date,
                 'day': day,
                 'red_line_people': red_line_people,
                 'orange_line_people': orange_line_people,
                 'total_people': total_people}

    return data_cols


def save_json(table_data, file_name):
    date = table_data['date'][1:]
    day = table_data['day'][1:]
    red_line_people = table_data['red_line_people'][1:]
    orange_line_people = table_data['orange_line_people'][1:]
    total_people = table_data['total_people'][1:]

    data = []
    try:
        for i, d in enumerate(date):
            data.append({'date': date[i],
                         'day': day[i],
                         'red_line_people': red_line_people[i],
                         'orange_line_people': orange_line_people[i],
                         'total_people': total_people[i]})
            # for testing
            # print date[i], day[i], red_line_people[i],
            #   orange_line_people[i], total_people[i]
    except Exception as e:
        print e
    with open(file_name + '.json', 'w') as json_file:
        json.dump(data, json_file, indent=4, ensure_ascii=False)
    json_file.close()


def run():
    parser = argparse.ArgumentParser(description='Print arguments')
    parser.add_argument("-p", "--proxy", help="set proxy")
    parser.add_argument("-l", "--url", help="set url of PDF")
    parser.add_argument("-n", "--name", help="set the file name")
    parser.add_argument("-s", "--pdfs", nargs='+', help="set a list of URLs of PDF")
    parser.add_argument("-N", "--names", nargs='+', help="set names for the list of PDF")
    args = parser.parse_args()
    global proxy, url, filename, pdfs, filenames
    proxy, url, filename, pdfs, filenames = args.proxy, args.url, args.name, args.pdfs, args.names

    if pdfs:
        assert filenames != None, 'files names can be found.'
        for i, pdf_url in enumerate(pdfs):
            download_file(pdf_url, filenames[i])
            save_json(data_extraction(filenames[i]), filenames[i])
    else:
        if filename is None:
            filename = file_name(url)
        download_file(url, filename)
        save_json(data_extraction(filename), filename)


if __name__ == '__main__':
    run()
