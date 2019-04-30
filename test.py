from cryptocmd import CmcScraper

# initialise scraper
scraper = CmcScraper('BTC', '15-07-2012', '01-08-2018')

# get data as list of list
headers, data = scraper.get_data()

# export the data to csv
scraper.export_csv("test.csv")

# get dataframe for the data
df = scraper.get_dataframe()