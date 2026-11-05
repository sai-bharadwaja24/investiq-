"""
NSE Stocks Master Directory
Comprehensive database of Indian equities listed on the National Stock Exchange (NSE).
Supports sub-millisecond prefix, word, and substring matching for live search suggestions.
"""

from typing import List, Dict, Any

NSE_STOCKS_DIRECTORY: List[Dict[str, str]] = [
    # Welspun Group & Textiles
    {"symbol": "WELSPUNLIV", "ticker": "WELSPUNLIV.NS", "name": "Welspun Living Limited", "sector": "Textiles & Home Fashion"},
    {"symbol": "WELCORP", "ticker": "WELCORP.NS", "name": "Welspun Corp Limited", "sector": "Iron & Steel Pipes"},
    {"symbol": "WELENT", "ticker": "WELENT.NS", "name": "Welspun Enterprises Limited", "sector": "Infrastructure"},
    {"symbol": "WELINV", "ticker": "WELINV.NS", "name": "Welspun Investments and Commercial", "sector": "Finance & Investments"},
    {"symbol": "WELSPLSOL", "ticker": "WELSPLSOL.NS", "name": "Welspun Specialty Solutions", "sector": "Metals & Special Alloys"},
    {"symbol": "WEL", "ticker": "WEL.NS", "name": "Wonder Electricals Limited", "sector": "Consumer Electricals"},
    {"symbol": "TRIDENT", "ticker": "TRIDENT.NS", "name": "Trident Limited", "sector": "Textiles & Paper"},
    {"symbol": "ALOKINDS", "ticker": "ALOKINDS.NS", "name": "Alok Industries Limited", "sector": "Textiles"},
    {"symbol": "RAYMOND", "ticker": "RAYMOND.NS", "name": "Raymond Limited", "sector": "Textiles & Apparel"},
    {"symbol": "KPRMILL", "ticker": "KPRMILL.NS", "name": "K.P.R. Mill Limited", "sector": "Textiles & Garments"},
    {"symbol": "PAGEIND", "ticker": "PAGEIND.NS", "name": "Page Industries (Jockey)", "sector": "Apparel & Innerwear"},
    {"symbol": "VBL", "ticker": "VBL.NS", "name": "Varun Beverages Limited", "sector": "Beverages / FMCG"},

    # High-Beta & Popular Retail Stocks
    {"symbol": "IFCI", "ticker": "IFCI.NS", "name": "IFCI Ltd (Industrial Finance)", "sector": "Financial Services"},
    {"symbol": "SUZLON", "ticker": "SUZLON.NS", "name": "Suzlon Energy Limited", "sector": "Renewable Energy"},
    {"symbol": "IRFC", "ticker": "IRFC.NS", "name": "Indian Railway Finance Corp", "sector": "Railways / NBFC"},
    {"symbol": "IREDA", "ticker": "IREDA.NS", "name": "Indian Renewable Energy Dev Agency", "sector": "Renewable Energy Finance"},
    {"symbol": "RVNL", "ticker": "RVNL.NS", "name": "Rail Vikas Nigam Limited", "sector": "Railway Infrastructure"},
    {"symbol": "IRCTC", "ticker": "IRCTC.NS", "name": "Indian Railway Catering & Tourism", "sector": "Railways & Tourism"},
    {"symbol": "BHEL", "ticker": "BHEL.NS", "name": "Bharat Heavy Electricals Ltd", "sector": "Capital Goods / Heavy Power"},
    {"symbol": "BEL", "ticker": "BEL.NS", "name": "Bharat Electronics Limited", "sector": "Defense Electronics"},
    {"symbol": "HAL", "ticker": "HAL.NS", "name": "Hindustan Aeronautics Limited", "sector": "Aerospace & Defense"},
    {"symbol": "MAZDOCK", "ticker": "MAZDOCK.NS", "name": "Mazagon Dock Shipbuilders", "sector": "Defense Shipbuilders"},
    {"symbol": "COCHINSHIP", "ticker": "COCHINSHIP.NS", "name": "Cochin Shipyard Limited", "sector": "Shipbuilding & Repair"},
    {"symbol": "NHPC", "ticker": "NHPC.NS", "name": "NHPC Limited", "sector": "Hydroelectric Power"},
    {"symbol": "SJVN", "ticker": "SJVN.NS", "name": "SJVN Limited", "sector": "Power Generation"},
    {"symbol": "NTPC", "ticker": "NTPC.NS", "name": "NTPC Limited", "sector": "Power Generation & Utilities"},
    {"symbol": "POWERGRID", "ticker": "POWERGRID.NS", "name": "Power Grid Corp of India", "sector": "Power Transmission"},
    {"symbol": "TATACHEM", "ticker": "TATACHEM.NS", "name": "Tata Chemicals Limited", "sector": "Commodity & Specialty Chemicals"},
    {"symbol": "TATAPOWER", "ticker": "TATAPOWER.NS", "name": "Tata Power Company Limited", "sector": "Power Generation & EV"},
    {"symbol": "TATACOMM", "ticker": "TATACOMM.NS", "name": "Tata Communications Limited", "sector": "Telecommunications"},
    {"symbol": "TATAELXSI", "ticker": "TATAELXSI.NS", "name": "Tata Elxsi Limited", "sector": "Design & Technology Services"},
    {"symbol": "TATATECH", "ticker": "TATATECH.NS", "name": "Tata Technologies Limited", "sector": "Engineering & Technology Services"},
    {"symbol": "TATAMOTORS", "ticker": "TATAMOTORS.NS", "name": "Tata Motors Limited", "sector": "Automobile & EV"},
    {"symbol": "TATASTEEL", "ticker": "TATASTEEL.NS", "name": "Tata Steel Limited", "sector": "Metals & Mining"},
    {"symbol": "TCS", "ticker": "TCS.NS", "name": "Tata Consultancy Services", "sector": "Information Technology"},
    {"symbol": "TATACONSUM", "ticker": "TATACONSUM.NS", "name": "Tata Consumer Products Ltd", "sector": "FMCG / Food & Beverages"},
    {"symbol": "VOLTAS", "ticker": "VOLTAS.NS", "name": "Voltas Limited (Tata Group)", "sector": "Air Conditioning & Engineering"},
    {"symbol": "TITAN", "ticker": "TITAN.NS", "name": "Titan Company Limited", "sector": "Jewelry, Watches & Eyewear"},
    {"symbol": "TRENT", "ticker": "TRENT.NS", "name": "Trent Limited (Westside/Zudio)", "sector": "Retail & Fashion"},

    # Reliance & Energy
    {"symbol": "RELIANCE", "ticker": "RELIANCE.NS", "name": "Reliance Industries Limited", "sector": "Oil & Gas / Retail / Telecom"},
    {"symbol": "RPOWER", "ticker": "RPOWER.NS", "name": "Reliance Power Limited", "sector": "Power Generation"},
    {"symbol": "RCOM", "ticker": "RCOM.NS", "name": "Reliance Communications Ltd", "sector": "Telecommunications"},
    {"symbol": "RHFL", "ticker": "RHFL.NS", "name": "Reliance Home Finance Ltd", "sector": "Housing Finance"},
    {"symbol": "ONGC", "ticker": "ONGC.NS", "name": "Oil and Natural Gas Corp Ltd", "sector": "Oil Exploration & Production"},
    {"symbol": "IOC", "ticker": "IOC.NS", "name": "Indian Oil Corporation Ltd", "sector": "Oil Refining & Marketing"},
    {"symbol": "BPCL", "ticker": "BPCL.NS", "name": "Bharat Petroleum Corp Ltd", "sector": "Oil Refining & Marketing"},
    {"symbol": "GAIL", "ticker": "GAIL.NS", "name": "GAIL (India) Limited", "sector": "Natural Gas Transmission"},
    {"symbol": "COALINDIA", "ticker": "COALINDIA.NS", "name": "Coal India Limited", "sector": "Mining & Minerals"},

    # Adani Group
    {"symbol": "ADANIENT", "ticker": "ADANIENT.NS", "name": "Adani Enterprises Limited", "sector": "Conglomerate & Incubator"},
    {"symbol": "ADANIPORTS", "ticker": "ADANIPORTS.NS", "name": "Adani Ports and SEZ Ltd", "sector": "Ports & Logistics"},
    {"symbol": "ADANIPOWER", "ticker": "ADANIPOWER.NS", "name": "Adani Power Limited", "sector": "Thermal Power Generation"},
    {"symbol": "ADANIGREEN", "ticker": "ADANIGREEN.NS", "name": "Adani Green Energy Limited", "sector": "Renewable Power"},
    {"symbol": "ATGL", "ticker": "ATGL.NS", "name": "Adani Total Gas Limited", "sector": "City Gas Distribution"},
    {"symbol": "AWL", "ticker": "AWL.NS", "name": "Adani Wilmar Limited (Fortune)", "sector": "Edible Oils & Foods"},
    {"symbol": "ADANIENSOL", "ticker": "ADANIENSOL.NS", "name": "Adani Energy Solutions Ltd", "sector": "Power Transmission & Smart Meter"},
    {"symbol": "AMBUJACEM", "ticker": "AMBUJACEM.NS", "name": "Ambuja Cements Limited", "sector": "Cement & Building Materials"},
    {"symbol": "ACC", "ticker": "ACC.NS", "name": "ACC Limited", "sector": "Cement & Building Materials"},

    # Banking & Financial Services
    {"symbol": "HDFCBANK", "ticker": "HDFCBANK.NS", "name": "HDFC Bank Limited", "sector": "Private Sector Banking"},
    {"symbol": "ICICIBANK", "ticker": "ICICIBANK.NS", "name": "ICICI Bank Limited", "sector": "Private Sector Banking"},
    {"symbol": "SBIN", "ticker": "SBIN.NS", "name": "State Bank of India", "sector": "Public Sector Banking"},
    {"symbol": "KOTAKBANK", "ticker": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank Ltd", "sector": "Private Sector Banking"},
    {"symbol": "AXISBANK", "ticker": "AXISBANK.NS", "name": "Axis Bank Limited", "sector": "Private Sector Banking"},
    {"symbol": "INDUSINDBK", "ticker": "INDUSINDBK.NS", "name": "IndusInd Bank Limited", "sector": "Private Sector Banking"},
    {"symbol": "BANKBARODA", "ticker": "BANKBARODA.NS", "name": "Bank of Baroda", "sector": "Public Sector Banking"},
    {"symbol": "PNB", "ticker": "PNB.NS", "name": "Punjab National Bank", "sector": "Public Sector Banking"},
    {"symbol": "CANBK", "ticker": "CANBK.NS", "name": "Canara Bank", "sector": "Public Sector Banking"},
    {"symbol": "UNIONBANK", "ticker": "UNIONBANK.NS", "name": "Union Bank of India", "sector": "Public Sector Banking"},
    {"symbol": "IDFCFIRSTB", "ticker": "IDFCFIRSTB.NS", "name": "IDFC First Bank Limited", "sector": "Private Sector Banking"},
    {"symbol": "FEDERALBNK", "ticker": "FEDERALBNK.NS", "name": "The Federal Bank Limited", "sector": "Private Sector Banking"},
    {"symbol": "BANDHANBNK", "ticker": "BANDHANBNK.NS", "name": "Bandhan Bank Limited", "sector": "Private Sector Banking"},
    {"symbol": "YESBANK", "ticker": "YESBANK.NS", "name": "Yes Bank Limited", "sector": "Private Sector Banking"},
    {"symbol": "J&KBANK", "ticker": "J&KBANK.NS", "name": "The Jammu & Kashmir Bank", "sector": "Banking"},
    {"symbol": "UCOBANK", "ticker": "UCOBANK.NS", "name": "UCO Bank", "sector": "Public Sector Banking"},
    {"symbol": "IOB", "ticker": "IOB.NS", "name": "Indian Overseas Bank", "sector": "Public Sector Banking"},
    {"symbol": "CENTRALBK", "ticker": "CENTRALBK.NS", "name": "Central Bank of India", "sector": "Public Sector Banking"},

    # NBFCs & Fintech
    {"symbol": "BAJFINANCE", "ticker": "BAJFINANCE.NS", "name": "Bajaj Finance Limited", "sector": "Consumer Lending NBFC"},
    {"symbol": "BAJAJFINSV", "ticker": "BAJAJFINSV.NS", "name": "Bajaj Finserv Limited", "sector": "Financial Services Holding"},
    {"symbol": "JIOFIN", "ticker": "JIOFIN.NS", "name": "Jio Financial Services Ltd", "sector": "NBFC & Financial Services"},
    {"symbol": "PAYTM", "ticker": "PAYTM.NS", "name": "One97 Communications (Paytm)", "sector": "Fintech & Payments"},
    {"symbol": "POLICYBZR", "ticker": "POLICYBZR.NS", "name": "PB Fintech (PolicyBazaar)", "sector": "Fintech & Insurance"},
    {"symbol": "CHOLAFIN", "ticker": "CHOLAFIN.NS", "name": "Cholamandalam Investment & Fin", "sector": "Vehicle Finance NBFC"},
    {"symbol": "SHRIRAMFIN", "ticker": "SHRIRAMFIN.NS", "name": "Shriram Finance Limited", "sector": "Commercial Vehicle Finance"},
    {"symbol": "MUTHOOTFIN", "ticker": "MUTHOOTFIN.NS", "name": "Muthoot Finance Limited", "sector": "Gold Loan NBFC"},
    {"symbol": "MANAPPURAM", "ticker": "MANAPPURAM.NS", "name": "Manappuram Finance Limited", "sector": "Gold Loan NBFC"},
    {"symbol": "PFC", "ticker": "PFC.NS", "name": "Power Finance Corporation", "sector": "Power Sector NBFC"},
    {"symbol": "RECLTD", "ticker": "RECLTD.NS", "name": "REC Limited", "sector": "Infrastructure & Power NBFC"},

    # IT & Technology
    {"symbol": "INFY", "ticker": "INFY.NS", "name": "Infosys Limited", "sector": "Information Technology"},
    {"symbol": "WIPRO", "ticker": "WIPRO.NS", "name": "Wipro Limited", "sector": "Information Technology"},
    {"symbol": "HCLTECH", "ticker": "HCLTECH.NS", "name": "HCL Technologies Limited", "sector": "Information Technology"},
    {"symbol": "TECHM", "ticker": "TECHM.NS", "name": "Tech Mahindra Limited", "sector": "Information Technology"},
    {"symbol": "LTIM", "ticker": "LTIM.NS", "name": "LTIMindtree Limited", "sector": "Information Technology"},
    {"symbol": "MPHASIS", "ticker": "MPHASIS.NS", "name": "Mphasis Limited", "sector": "Information Technology"},
    {"symbol": "COFORGE", "ticker": "COFORGE.NS", "name": "Coforge Limited", "sector": "Information Technology"},
    {"symbol": "PERSISTENT", "ticker": "PERSISTENT.NS", "name": "Persistent Systems Limited", "sector": "Software & Digital Services"},
    {"symbol": "KPITTECH", "ticker": "KPITTECH.NS", "name": "KPIT Technologies Limited", "sector": "Automotive Software"},
    {"symbol": "ZOMATO", "ticker": "ZOMATO.NS", "name": "Zomato Limited (Blinkit)", "sector": "Food Delivery & Quick Commerce"},
    {"symbol": "SWIGGY", "ticker": "SWIGGY.NS", "name": "Swiggy Limited", "sector": "Food Delivery & Quick Commerce"},
    {"symbol": "NAUKRI", "ticker": "NAUKRI.NS", "name": "Info Edge (India) Limited", "sector": "Internet Portals & Tech"},
    {"symbol": "NYKAA", "ticker": "NYKAA.NS", "name": "FSN E-Commerce (Nykaa)", "sector": "Beauty & Fashion E-Commerce"},
    {"symbol": "DELHIVERY", "ticker": "DELHIVERY.NS", "name": "Delhivery Limited", "sector": "Logistics & Supply Chain"},

    # Automobile & Auto Ancillary
    {"symbol": "MARUTI", "ticker": "MARUTI.NS", "name": "Maruti Suzuki India Ltd", "sector": "Passenger Cars"},
    {"symbol": "M&M", "ticker": "M&M.NS", "name": "Mahindra & Mahindra Limited", "sector": "Automobile & Tractors"},
    {"symbol": "BAJAJ-AUTO", "ticker": "BAJAJ-AUTO.NS", "name": "Bajaj Auto Limited", "sector": "Two & Three Wheelers"},
    {"symbol": "HEROMOTOCO", "ticker": "HEROMOTOCO.NS", "name": "Hero MotoCorp Limited", "sector": "Two Wheelers"},
    {"symbol": "EICHERMOT", "ticker": "EICHERMOT.NS", "name": "Eicher Motors (Royal Enfield)", "sector": "Automobile & Trucks"},
    {"symbol": "TVSMOTOR", "ticker": "TVSMOTOR.NS", "name": "TVS Motor Company Limited", "sector": "Two & Three Wheelers"},
    {"symbol": "ASHOKLEY", "ticker": "ASHOKLEY.NS", "name": "Ashok Leyland Limited", "sector": "Commercial Vehicles"},
    {"symbol": "BHARATFORG", "ticker": "BHARATFORG.NS", "name": "Bharat Forge Limited", "sector": "Forging & Auto Components"},
    {"symbol": "MOTHERSON", "ticker": "MOTHERSON.NS", "name": "Samvardhana Motherson Intl", "sector": "Automotive Wiring & Mirrors"},
    {"symbol": "BOSCHLTD", "ticker": "BOSCHLTD.NS", "name": "Bosch Limited", "sector": "Auto Components & Engineering"},
    {"symbol": "MRF", "ticker": "MRF.NS", "name": "MRF Limited", "sector": "Tyres & Rubber"},
    {"symbol": "APOLLOTYRE", "ticker": "APOLLOTYRE.NS", "name": "Apollo Tyres Limited", "sector": "Tyres & Rubber"},
    {"symbol": "BALKRISIND", "ticker": "BALKRISIND.NS", "name": "Balkrishna Industries Ltd", "sector": "Off-Highway Tyres"},

    # FMCG, Consumption & Healthcare
    {"symbol": "ITC", "ticker": "ITC.NS", "name": "ITC Limited", "sector": "Cigarettes, FMCG, Hotels, Paper"},
    {"symbol": "HINDUNILVR", "ticker": "HINDUNILVR.NS", "name": "Hindustan Unilever Limited", "sector": "FMCG / Household Care"},
    {"symbol": "NESTLEIND", "ticker": "NESTLEIND.NS", "name": "Nestle India Limited", "sector": "Food & Beverages"},
    {"symbol": "BRITANNIA", "ticker": "BRITANNIA.NS", "name": "Britannia Industries Limited", "sector": "Bakery & Dairy Products"},
    {"symbol": "DABUR", "ticker": "DABUR.NS", "name": "Dabur India Limited", "sector": "Ayurvedic & Healthcare FMCG"},
    {"symbol": "MARICO", "ticker": "MARICO.NS", "name": "Marico Limited (Parachute)", "sector": "Personal & Edible Care"},
    {"symbol": "GODREJCP", "ticker": "GODREJCP.NS", "name": "Godrej Consumer Products", "sector": "Personal & Home Care"},
    {"symbol": "COLPAL", "ticker": "COLPAL.NS", "name": "Colgate-Palmolive (India)", "sector": "Oral Care FMCG"},
    {"symbol": "SUNPHARMA", "ticker": "SUNPHARMA.NS", "name": "Sun Pharma Industries Ltd", "sector": "Pharmaceuticals"},
    {"symbol": "DRREDDY", "ticker": "DRREDDY.NS", "name": "Dr. Reddy's Laboratories", "sector": "Pharmaceuticals"},
    {"symbol": "CIPLA", "ticker": "CIPLA.NS", "name": "Cipla Limited", "sector": "Pharmaceuticals & Respiratory"},
    {"symbol": "DIVISLAB", "ticker": "DIVISLAB.NS", "name": "Divi's Laboratories Limited", "sector": "Active Pharmaceutical Ingr."},
    {"symbol": "LUPIN", "ticker": "LUPIN.NS", "name": "Lupin Limited", "sector": "Pharmaceuticals"},
    {"symbol": "APOLLOHOSP", "ticker": "APOLLOHOSP.NS", "name": "Apollo Hospitals Enterprise", "sector": "Healthcare & Hospitals"},
    {"symbol": "FORTIS", "ticker": "FORTIS.NS", "name": "Fortis Healthcare Limited", "sector": "Hospitals & Diagnostics"},
    {"symbol": "MAXHEALTH", "ticker": "MAXHEALTH.NS", "name": "Max Healthcare Institute", "sector": "Hospitals & Healthcare"},

    # Metals, Mining & Cement
    {"symbol": "JSWSTEEL", "ticker": "JSWSTEEL.NS", "name": "JSW Steel Limited", "sector": "Steel & Metallurgy"},
    {"symbol": "HINDALCO", "ticker": "HINDALCO.NS", "name": "Hindalco Industries Limited", "sector": "Aluminium & Copper"},
    {"symbol": "VEDL", "ticker": "VEDL.NS", "name": "Vedanta Limited", "sector": "Diversified Metals & Mining"},
    {"symbol": "JINDALSTEL", "ticker": "JINDALSTEL.NS", "name": "Jindal Steel & Power Ltd", "sector": "Steel & Power"},
    {"symbol": "NMDC", "ticker": "NMDC.NS", "name": "NMDC Limited", "sector": "Iron Ore Mining"},
    {"symbol": "SAIL", "ticker": "SAIL.NS", "name": "Steel Authority of India Ltd", "sector": "Public Sector Steel"},
    {"symbol": "ULTRACEMCO", "ticker": "ULTRACEMCO.NS", "name": "UltraTech Cement Limited", "sector": "Cement & Building Materials"},
    {"symbol": "SHREECEM", "ticker": "SHREECEM.NS", "name": "Shree Cement Limited", "sector": "Cement & Building Materials"},
    {"symbol": "DALBHARAT", "ticker": "DALBHARAT.NS", "name": "Dalmia Bharat Limited", "sector": "Cement Manufacturing"},

    # Infrastructure & Telecom
    {"symbol": "LT", "ticker": "LT.NS", "name": "Larsen & Toubro Limited", "sector": "Engineering & Construction"},
    {"symbol": "BHARTIARTL", "ticker": "BHARTIARTL.NS", "name": "Bharti Airtel Limited", "sector": "Telecommunications"},
    {"symbol": "IDEA", "ticker": "IDEA.NS", "name": "Vodafone Idea Limited", "sector": "Telecommunications"},
    {"symbol": "INDUSTOWER", "ticker": "INDUSTOWER.NS", "name": "Indus Towers Limited", "sector": "Telecom Infrastructure Towers"},
    {"symbol": "DLF", "ticker": "DLF.NS", "name": "DLF Limited", "sector": "Real Estate Development"},
    {"symbol": "GODREJPROP", "ticker": "GODREJPROP.NS", "name": "Godrej Properties Limited", "sector": "Real Estate Development"},
    {"symbol": "MACROTECH", "ticker": "MACROTECH.NS", "name": "Macrotech Developers (Lodha)", "sector": "Real Estate Development"},
    {"symbol": "OBEROIRLTY", "ticker": "OBEROIRLTY.NS", "name": "Oberoi Realty Limited", "sector": "Real Estate Development"},
    {"symbol": "PRESTIGE", "ticker": "PRESTIGE.NS", "name": "Prestige Estates Projects", "sector": "Real Estate Development"},
]

def search_nse_directory(query: str, limit: int = 8) -> List[Dict[str, str]]:
    """
    Sub-millisecond prefix, word, and substring matching for live stock search suggestions.
    Matches queries like 'WEL' -> Welspun Living, 'TAT' -> Tata Motors, etc.
    """
    q = query.strip().upper()
    if not q:
        return []

    exact_matches: List[Dict[str, str]] = []
    symbol_starts: List[Dict[str, str]] = []
    name_word_starts: List[Dict[str, str]] = []
    substring_matches: List[Dict[str, str]] = []
    seen_symbols = set()

    for stock in NSE_STOCKS_DIRECTORY:
        sym = stock["symbol"].upper()
        name = stock["name"].upper()

        if sym == q:
            exact_matches.append(stock)
            seen_symbols.add(sym)
        elif sym.startswith(q):
            symbol_starts.append(stock)
            seen_symbols.add(sym)
        else:
            # Check if any word in the name starts with the query (e.g. 'WEL' matches 'Welspun Living')
            words = name.split()
            if any(w.startswith(q) for w in words):
                name_word_starts.append(stock)
                seen_symbols.add(sym)
            elif q in sym or q in name:
                substring_matches.append(stock)
                seen_symbols.add(sym)

    # Combine in order of relevance
    combined = exact_matches + symbol_starts + name_word_starts + substring_matches
    return combined[:limit]
