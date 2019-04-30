from cryptocmd import CmcScraper
from time import gmtime, strftime
import csv
import json
import matplotlib.pyplot as plt
import numpy as np
import time


currencyList = ['BTC','ETH','XRP','BCH','EOS','XLM','LTC','ADA','TRX','NEO','OMG','BCN','QTUM','BNB','ETC','XEM','DASH','XMR','USDT']

def predict(allVal,currency):
	
	x = []
	y = []
	day = 30
	degree = 5

	i = 0
	while i < day:
		x.append(i)
		y.append(allVal[i])
		i = i + 1

	y.reverse()
	#print y

	z = np.polyfit(x, y, degree)
	f = np.poly1d(z)
	#print f(day)
	return f(day)


def main():
	global currencyList
	n = 0
	curDay = strftime("%d-%m-%Y", gmtime())

	l = len(currencyList)
	#l = 1
	while n < l:
		# initialise scraper
		scraper = CmcScraper(currencyList[n], '01-01-2000', curDay)

		# # get data as list of list
		headers, data = scraper.get_data()

		# # export the data to csv
		scraper.export_csv('history/'+currencyList[n]+".csv")

		# # get dataframe for the data
		df = scraper.get_dataframe()

		x = []
		y = []
		with open('history/'+currencyList[n]+'.csv', 'r') as f:
		    sreader = csv.reader(f)

		    i = 0 
		    for row in sreader:
		        if i > 0 :
		        	x.append(i)
		        	y.append((float(row[2]) + float(row[3]))/2)

		        i = i + 1

		prediction = predict(y,currencyList[n])

		print currencyList[n] + ' => ' + str(prediction) 

		y.reverse()
		data = {}
		data["pointStart"] = 1230764400000
		data["pointInterval"] = 3600000
		data["dataLength"] = len(y)
		data["data"] = y
		data["prediction"] = prediction

		json_data = json.dumps(data)

		#print json_data
		file = open('public/'+currencyList[n]+'.json', 'w') 
		file.write(json_data)
		file.close() 

		n = n+1


while 1 == 1:
	main()
	curDay = strftime("%d-%m-%Y", gmtime())
	while curDay.find(strftime("%d-%m-%Y", gmtime())) > -1:
		time.sleep(1000)