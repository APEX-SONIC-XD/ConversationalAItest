// Study mode: one generic car sketch for every vehicle so the image never
// reveals the actual body type during participant interviews.
const SKETCH_IMG = 'https://plus.unsplash.com/premium_vector-1733984597729-fad43b660da0?fm=jpg&q=60&w=900&auto=format&fit=crop';

const BASE_VEHICLES = [
  {
    id: 1, stockNum: 'DC10001', vin: '1HGCV1F34MA001234',
    year: 2021, make: 'Honda', model: 'Accord', trim: 'Sport',
    body: 'Sedan', extColor: 'Lunar Silver Metallic', intColor: 'Black',
    price: 24988, mileage: 32150, mpgCity: 30, mpgHwy: 38,
    engine: '1.5L Turbocharged 4-Cyl', hp: 192,
    transmission: 'CVT Automatic', drivetrain: 'FWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 1500,
    features: ['Apple CarPlay / Android Auto','Backup Camera','Blind Spot Monitoring',
      'Heated Front Seats','Sunroof / Moonroof','Push-Button Start',
      'LED Headlights','Lane Keeping Assist','Adaptive Cruise Control','Honda Sensing Suite'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'This 2021 Honda Accord Sport is in excellent condition with low miles and a spotless Carfax history. Loaded with the latest tech and safety features, this one-owner vehicle is ready for its next adventure.',
    location: 'Denver, CO'
  },
  {
    id: 2, stockNum: 'DC10002', vin: '4T3RWRFV0MU000567',
    year: 2020, make: 'Toyota', model: 'RAV4', trim: 'XLE Premium',
    body: 'SUV', extColor: 'Midnight Black Metallic', intColor: 'Black',
    price: 29488, mileage: 38200, mpgCity: 27, mpgHwy: 35,
    engine: '2.5L 4-Cylinder', hp: 203,
    transmission: '8-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'hot-deal', dealLabel: 'Hot Deal', marketSavings: 2200,
    features: ['Toyota Safety Sense 2.0','Apple CarPlay / Android Auto','Power Liftgate',
      'Heated Front Seats','Dual-Zone Climate Control','Panoramic Moonroof',
      'Blind Spot Monitor','Rear Cross-Traffic Alert','LED Headlights','All-Wheel Drive'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'A well-maintained 2020 Toyota RAV4 XLE Premium with AWD and only one previous owner. Perfect family SUV with excellent safety scores and a comfortable, feature-rich interior.',
    location: 'Denver, CO'
  },
  {
    id: 3, stockNum: 'DC10003', vin: '1FTFW1E80NFB03456',
    year: 2022, make: 'Ford', model: 'F-150', trim: 'XLT',
    body: 'Truck', extColor: 'Magnetic Gray Metallic', intColor: 'Medium Dark Pewter',
    price: 39990, mileage: 22800, mpgCity: 19, mpgHwy: 24,
    engine: '2.7L EcoBoost V6', hp: 325,
    transmission: '10-Speed Automatic', drivetrain: '4WD',
    owners: 2, accidentFree: true,
    dealBadge: 'low-miles', dealLabel: 'Low Miles', marketSavings: 800,
    features: ['SYNC 4 Infotainment','Apple CarPlay / Android Auto','Pro Trailer Backup Assist',
      'Bed Liner','Trailer Tow Package','Heated Front Seats','FordPass Connect',
      'LED Headlamps','360° Camera','Pre-Collision Assist'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'This 2022 Ford F-150 XLT is loaded and ready to work. Low miles, clean Carfax, and all the capability you need. Whether you\'re hauling or commuting, this truck does it all.',
    location: 'Denver, CO'
  },
  {
    id: 4, stockNum: 'DC10004', vin: '3GNAXUEV5ML012345',
    year: 2021, make: 'Chevrolet', model: 'Equinox', trim: 'LT',
    body: 'SUV', extColor: 'Iridescent Pearl Tricoat', intColor: 'Jet Black',
    price: 25488, mileage: 29600, mpgCity: 26, mpgHwy: 31,
    engine: '1.5L Turbocharged 4-Cyl', hp: 170,
    transmission: '6-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 1100,
    features: ['Chevy Infotainment 3','Apple CarPlay / Android Auto','Remote Start',
      'Heated Front Seats','Power Liftgate','Rear Park Assist',
      'Lane Change Alert','Following Distance Indicator','HD Rear Camera','Teen Driver Technology'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'This 2021 Chevrolet Equinox LT AWD is a one-owner, accident-free vehicle that has been meticulously maintained. Great fuel economy and packed with modern safety technology.',
    location: 'Aurora, CO'
  },
  {
    id: 5, stockNum: 'DC10005', vin: '5NPE34AF2LH567890',
    year: 2020, make: 'Hyundai', model: 'Sonata', trim: 'SEL Plus',
    body: 'Sedan', extColor: 'Quartz White Pearl', intColor: 'Black',
    price: 22490, mileage: 41500, mpgCity: 28, mpgHwy: 38,
    engine: '1.6L Turbocharged 4-Cyl', hp: 180,
    transmission: '8-Speed Dual-Clutch Auto', drivetrain: 'FWD',
    owners: 1, accidentFree: true,
    dealBadge: null, dealLabel: null, marketSavings: 0,
    features: ['10.25" Touchscreen','Wireless Apple CarPlay','Wireless Android Auto',
      'Bose Premium Sound','Ventilated & Heated Front Seats','Highway Driving Assist',
      'Smart Parking Assist','Blind Spot Collision Warning','Rear Traffic Alert','Sunroof'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'A stunning 2020 Hyundai Sonata SEL Plus with premium amenities at a great price. Wireless CarPlay, Bose audio, and ventilated seats make every drive a pleasure.',
    location: 'Denver, CO'
  },
  {
    id: 6, stockNum: 'DC10006', vin: '4T1BZ1HK3NU098765',
    year: 2022, make: 'Toyota', model: 'Camry', trim: 'SE',
    body: 'Sedan', extColor: 'Midnight Black Metallic', intColor: 'Black',
    price: 27988, mileage: 18900, mpgCity: 28, mpgHwy: 39,
    engine: '2.5L 4-Cylinder', hp: 203,
    transmission: '8-Speed Automatic', drivetrain: 'FWD',
    owners: 1, accidentFree: true,
    dealBadge: 'low-miles', dealLabel: 'Low Miles', marketSavings: 1800,
    features: ['Toyota Safety Sense 2.5+','9" Multimedia Display','Apple CarPlay / Android Auto',
      'Heated Front Seats','Sport Front Seats','Push-Button Start','JBL Premium Audio',
      'Sport-Tuned Suspension','LED Headlamps','Rear Spoiler'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Barely broken in, this 2022 Toyota Camry SE has under 19,000 miles and feels like new. Sport-tuned suspension, JBL audio, and Toyota\'s top safety suite make this a standout deal.',
    location: 'Denver, CO'
  },
  {
    id: 7, stockNum: 'DC10007', vin: 'JM3KFBDM3M0345678',
    year: 2021, make: 'Mazda', model: 'CX-5', trim: 'Grand Touring',
    body: 'SUV', extColor: 'Soul Red Crystal Metallic', intColor: 'Parchment',
    price: 32490, mileage: 24100, mpgCity: 24, mpgHwy: 30,
    engine: '2.5L Turbocharged 4-Cyl', hp: 256,
    transmission: '6-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 2500,
    features: ['10.25" Mazda Connect','Apple CarPlay / Android Auto','Bose 10-Speaker Audio',
      'Heated & Ventilated Leather Seats','Heated Rear Seats','Power Sunroof',
      'Head-Up Display','360° View Monitor','Driver Attention Alert','i-ACTIVSENSE Safety Suite'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'The Mazda CX-5 Grand Touring Reserve is in a class of its own. With the turbocharged engine, premium interior, and stunning Soul Red exterior, this is the SUV that turns heads.',
    location: 'Englewood, CO'
  },
  {
    id: 8, stockNum: 'DC10008', vin: '5J6RW1H89LA234567',
    year: 2020, make: 'Honda', model: 'CR-V', trim: 'EX-L',
    body: 'SUV', extColor: 'Lunar Silver Metallic', intColor: 'Gray',
    price: 27988, mileage: 43200, mpgCity: 28, mpgHwy: 34,
    engine: '1.5L Turbocharged 4-Cyl', hp: 190,
    transmission: 'CVT Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'priced-to-sell', dealLabel: 'Priced to Sell', marketSavings: 600,
    features: ['Honda Sensing Suite','Apple CarPlay / Android Auto','Leather-Trimmed Seats',
      'Heated Front Seats','Power Moonroof','Hands-Free Power Tailgate',
      'Wireless Phone Charger','Heated Steering Wheel','Multi-Angle Rearview Camera','All-Wheel Drive'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'This 2020 Honda CR-V EX-L AWD has been a trusted family hauler with only one owner. The EX-L trim adds leather seats, heated steering wheel, and hands-free tailgate — all at a compelling price.',
    location: 'Littleton, CO'
  },
  {
    id: 9, stockNum: 'DC10009', vin: '3VWB57BU0MM678901',
    year: 2021, make: 'Volkswagen', model: 'Jetta', trim: 'SE',
    body: 'Sedan', extColor: 'White Silver Metallic', intColor: 'Black',
    price: 21988, mileage: 29700, mpgCity: 30, mpgHwy: 40,
    engine: '1.4L Turbocharged 4-Cyl', hp: 147,
    transmission: '8-Speed Automatic', drivetrain: 'FWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 900,
    features: ['8" Touchscreen','App-Connect (CarPlay/Android)','Ambient Interior Lighting',
      'Heated Front Seats','Sunroof','Adaptive Cruise Control',
      'Emergency Braking','Blind Spot Monitor','Rear Traffic Alert','Push-Button Start'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'The 2021 VW Jetta SE delivers a refined European driving experience at an approachable price. Excellent fuel economy, premium ambient lighting, and a spacious cabin make this a daily-driver dream.',
    location: 'Denver, CO'
  },
  {
    id: 10, stockNum: 'DC10010', vin: '5XYPGDA54NG567890',
    year: 2022, make: 'Kia', model: 'Sportage', trim: 'EX',
    body: 'SUV', extColor: 'Snow White Pearl', intColor: 'Black',
    price: 29490, mileage: 16300, mpgCity: 23, mpgHwy: 30,
    engine: '2.5L 4-Cylinder', hp: 187,
    transmission: '8-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'low-miles', dealLabel: 'Low Miles', marketSavings: 1400,
    features: ['10.25" Navigation Display','Apple CarPlay / Android Auto','Wireless Charging',
      'Heated & Ventilated Front Seats','Heated Rear Seats','Panoramic Sunroof',
      'Harman/Kardon Audio','360° Surround View Monitor','Highway Driving Assist 2','All-Wheel Drive'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Nearly new, this 2022 Kia Sportage EX AWD has just 16,300 miles and is loaded with features. The panoramic sunroof, Harman/Kardon audio, and ventilated seats make it feel truly luxurious.',
    location: 'Denver, CO'
  },
  {
    id: 11, stockNum: 'DC10011', vin: '1N4BL4DV0LC234567',
    year: 2020, make: 'Nissan', model: 'Altima', trim: 'SR',
    body: 'Sedan', extColor: 'Deep Blue Pearl', intColor: 'Charcoal',
    price: 19988, mileage: 47800, mpgCity: 28, mpgHwy: 39,
    engine: '2.5L 4-Cylinder', hp: 188,
    transmission: 'CVT Automatic', drivetrain: 'FWD',
    owners: 1, accidentFree: true,
    dealBadge: 'priced-to-sell', dealLabel: 'Priced to Sell', marketSavings: 700,
    features: ['8" Touchscreen','Apple CarPlay / Android Auto','Nissan Safety Shield 360',
      'Heated Front Seats','Sport Front Seats','Rear Spoiler',
      'LED Headlights','Intelligent Cruise Control','Lane Departure Warning','Blind Spot Warning'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Get into a sporty sedan without breaking the bank. This 2020 Nissan Altima SR offers excellent value with the full Nissan Safety Shield 360 suite and sporty styling.',
    location: 'Denver, CO'
  },
  {
    id: 12, stockNum: 'DC10012', vin: '1FMCU9GD5MUA89012',
    year: 2021, make: 'Ford', model: 'Escape', trim: 'SEL',
    body: 'SUV', extColor: 'Iconic Silver Metallic', intColor: 'Ebony',
    price: 26490, mileage: 33500, mpgCity: 26, mpgHwy: 31,
    engine: '1.5L EcoBoost Turbocharged 3-Cyl', hp: 181,
    transmission: '8-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: null, dealLabel: null, marketSavings: 0,
    features: ['12" SYNC 4 Display','Wireless Apple CarPlay','Wireless Android Auto',
      'Heated Leather Seats','Dual-Zone Climate Control','Hands-Free Liftgate',
      'Co-Pilot360 Safety Suite','Wireless Charging Pad','360° Camera System','Ford Pass Connect'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'This 2021 Ford Escape SEL AWD is the ideal blend of practicality and modern tech. With a large SYNC 4 touchscreen, wireless CarPlay, and heated leather seats, it punches well above its price.',
    location: 'Lakewood, CO'
  },
  {
    id: 13, stockNum: 'DC10013', vin: 'JF2SKADC5MH234567',
    year: 2021, make: 'Subaru', model: 'Forester', trim: 'Premium',
    body: 'SUV', extColor: 'Crystal White Pearl', intColor: 'Black',
    price: 28990, mileage: 27400, mpgCity: 26, mpgHwy: 33,
    engine: '2.5L 4-Cylinder', hp: 182,
    transmission: 'CVT Lineartronic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 1600,
    features: ['EyeSight Driver Assist','Apple CarPlay / Android Auto','All-Weather Package',
      'Heated Front Seats','Power Moonroof','X-Mode AWD',
      'Blind Spot Detection','Rear Cross-Traffic Alert','Roof Rails','All-Wheel Drive'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'This 2021 Subaru Forester Premium is built for Colorado winters. Standard Symmetrical AWD, EyeSight safety, and excellent ground clearance make it a confident choice near the mountains.',
    location: 'Boulder, CO'
  },
  {
    id: 14, stockNum: 'DC10014', vin: '4S4BSANC5L3456789',
    year: 2020, make: 'Subaru', model: 'Outback', trim: 'Limited',
    body: 'SUV', extColor: 'Magnetite Gray Metallic', intColor: 'Saddle Brown',
    price: 30988, mileage: 35800, mpgCity: 26, mpgHwy: 33,
    engine: '2.5L 4-Cylinder', hp: 182,
    transmission: 'CVT Lineartronic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'hot-deal', dealLabel: 'Hot Deal', marketSavings: 1900,
    features: ['EyeSight Driver Assist','11.6" STARLINK Multimedia','Apple CarPlay / Android Auto',
      'Heated Leather Seats','Power Liftgate','Harmon Kardon Audio',
      'Driver Focus Monitor','Reverse Automatic Braking','X-Mode AWD','All-Wheel Drive'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'A capable 2020 Subaru Outback Limited with the tech and comfort you want for ski trips and daily commuting. One owner, clean history, and ready for year-round driving.',
    location: 'Fort Collins, CO'
  },
  {
    id: 15, stockNum: 'DC10015', vin: '5J8TC2H69ML123456',
    year: 2021, make: 'Acura', model: 'RDX', trim: 'Technology',
    body: 'SUV', extColor: 'Performance Red Pearl', intColor: 'Ebony',
    price: 33990, mileage: 26800, mpgCity: 22, mpgHwy: 28,
    engine: '2.0L Turbocharged 4-Cyl', hp: 272,
    transmission: '10-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 2100,
    features: ['AcuraWatch Plus','Apple CarPlay / Android Auto','ELS Studio Audio',
      'Heated Leather Seats','Power Liftgate','Panoramic Moonroof',
      'Blind Spot Information','Adaptive Cruise Control','All-Wheel Drive','Wireless Charging'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Premium without the premium price tag — this one-owner Acura RDX Technology packs turbo power, a refined cabin, and Acura\'s full safety suite.',
    location: 'Denver, CO'
  },
  {
    id: 16, stockNum: 'DC10016', vin: '2T2BZMCA5LC234567',
    year: 2020, make: 'Lexus', model: 'RX', trim: '350',
    body: 'SUV', extColor: 'Atomic Silver', intColor: 'Parchment',
    price: 38988, mileage: 31200, mpgCity: 20, mpgHwy: 27,
    engine: '3.5L V6', hp: 295,
    transmission: '8-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'hot-deal', dealLabel: 'Hot Deal', marketSavings: 2800,
    features: ['Lexus Safety System+','Apple CarPlay / Android Auto','Premium Audio',
      'Heated & Ventilated Front Seats','Power Liftgate','Triple-Beam LED Headlamps',
      'Blind Spot Monitor','Panoramic View Monitor','All-Wheel Drive','Power Moonroof'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'The Lexus RX 350 remains the benchmark for comfort and reliability in the midsize luxury SUV segment. Quiet, capable, and impeccably maintained.',
    location: 'Englewood, CO'
  },
  {
    id: 17, stockNum: 'DC10017', vin: '5UXCR6C05M9A345678',
    year: 2021, make: 'BMW', model: 'X3', trim: 'xDrive30i',
    body: 'SUV', extColor: 'Alpine White', intColor: 'Black',
    price: 36490, mileage: 24500, mpgCity: 23, mpgHwy: 29,
    engine: '2.0L Turbocharged 4-Cyl', hp: 248,
    transmission: '8-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 2400,
    features: ['BMW Live Cockpit Pro','Apple CarPlay / Android Auto','SensaTec Leather',
      'Heated Front Seats','Power Liftgate','Parking Assistant Plus',
      'Active Driving Assistant','Harman/Kardon Audio','xDrive AWD','Panoramic Sunroof'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Sporty and refined, this BMW X3 xDrive30i delivers the driving feel BMW is known for with everyday SUV practicality and xDrive confidence.',
    location: 'Boulder, CO'
  },
  {
    id: 18, stockNum: 'DC10018', vin: 'W1N4J4HB5LW456789',
    year: 2020, make: 'Mercedes-Benz', model: 'GLC', trim: '300',
    body: 'SUV', extColor: 'Obsidian Black Metallic', intColor: 'Black',
    price: 37488, mileage: 33400, mpgCity: 22, mpgHwy: 29,
    engine: '2.0L Turbocharged 4-Cyl', hp: 255,
    transmission: '9-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'low-miles', dealLabel: 'Low Miles', marketSavings: 2600,
    features: ['MBUX Infotainment','Apple CarPlay / Android Auto','Premium Package',
      'Heated Front Seats','Power Liftgate','Blind Spot Assist',
      'Active Brake Assist','Burmester Audio','4MATIC AWD','Panorama Sunroof'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Mercedes-Benz quality in a right-sized SUV. This GLC 300 4MATIC combines a premium cabin, smooth ride, and the tech you expect from the three-pointed star.',
    location: 'Denver, CO'
  },
  {
    id: 19, stockNum: 'DC10019', vin: 'WA1AAAFY5M2123456',
    year: 2021, make: 'Audi', model: 'Q5', trim: 'Premium Plus',
    body: 'SUV', extColor: 'Daytona Gray Pearl', intColor: 'Black',
    price: 35490, mileage: 27900, mpgCity: 22, mpgHwy: 28,
    engine: '2.0L Turbocharged 4-Cyl', hp: 261,
    transmission: '7-Speed S tronic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 2200,
    features: ['Audi Virtual Cockpit','Apple CarPlay / Android Auto','Leather Seating',
      'Heated Front Seats','Power Tailgate','Audi Pre Sense Front',
      'Lane Departure Warning','Bang & Olufsen Audio','quattro AWD','Panoramic Sunroof'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Audi\'s best-selling SUV for good reason — sharp design, quattro grip, and a tech-forward cabin make this Q5 Premium Plus a standout.',
    location: 'Littleton, CO'
  },
  {
    id: 20, stockNum: 'DC10020', vin: '1C4RJFBG5LC567890',
    year: 2020, make: 'Jeep', model: 'Grand Cherokee', trim: 'Limited',
    body: 'SUV', extColor: 'Billet Silver Metallic', intColor: 'Black',
    price: 28990, mileage: 40100, mpgCity: 19, mpgHwy: 26,
    engine: '3.6L V6', hp: 293,
    transmission: '8-Speed Automatic', drivetrain: '4WD',
    owners: 1, accidentFree: true,
    dealBadge: 'priced-to-sell', dealLabel: 'Priced to Sell', marketSavings: 900,
    features: ['Uconnect 4C NAV','Apple CarPlay / Android Auto','Leather-Trimmed Seats',
      'Heated Front & Rear Seats','Power Liftgate','Selec-Terrain Traction',
      'Blind Spot Monitoring','ParkView Rear Camera','4WD','Dual-Pane Sunroof'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'A capable Colorado SUV with real 4WD hardware, a comfortable Limited trim, and the versatility Jeep owners love.',
    location: 'Colorado Springs, CO'
  },
  {
    id: 21, stockNum: 'DC10021', vin: '3GKALYEV5ML678901',
    year: 2021, make: 'GMC', model: 'Terrain', trim: 'SLT',
    body: 'SUV', extColor: 'Summit White', intColor: 'Jet Black',
    price: 27490, mileage: 29300, mpgCity: 25, mpgHwy: 30,
    engine: '1.5L Turbocharged 4-Cyl', hp: 170,
    transmission: '9-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: null, dealLabel: null, marketSavings: 0,
    features: ['GMC Infotainment System','Apple CarPlay / Android Auto','Leather-Appointed Seats',
      'Heated Front Seats','Power Liftgate','Following Distance Indicator',
      'Lane Keep Assist','Rear Park Assist','AWD','Roof-Mounted Cargo Rails'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'The GMC Terrain SLT offers upscale styling and a quiet ride in a compact SUV footprint — ideal for city and mountain trips alike.',
    location: 'Aurora, CO'
  },
  {
    id: 22, stockNum: 'DC10022', vin: 'KL4CJESB5MB789012',
    year: 2021, make: 'Buick', model: 'Encore GX', trim: 'Essence',
    body: 'SUV', extColor: 'Satin Steel Metallic', intColor: 'Ebony',
    price: 24490, mileage: 31800, mpgCity: 26, mpgHwy: 30,
    engine: '1.3L Turbocharged 3-Cyl', hp: 155,
    transmission: '9-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 1100,
    features: ['Buick Infotainment','Apple CarPlay / Android Auto','QuietTuning Cabin',
      'Heated Front Seats','Power Liftgate','Rear Vision Camera',
      'Lane Keep Assist','Following Distance Indicator','AWD','Keyless Open & Start'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Buick\'s Encore GX Essence delivers a surprisingly quiet, comfortable drive with good fuel economy and easy parking in tight spaces.',
    location: 'Westminster, CO'
  },
  {
    id: 23, stockNum: 'DC10023', vin: '1C4RDJDG5LC890123',
    year: 2020, make: 'Dodge', model: 'Durango', trim: 'GT',
    body: 'SUV', extColor: 'Granite Crystal Metallic', intColor: 'Black',
    price: 31988, mileage: 44200, mpgCity: 19, mpgHwy: 26,
    engine: '3.6L V6', hp: 293,
    transmission: '8-Speed Automatic', drivetrain: 'AWD',
    owners: 2, accidentFree: true,
    dealBadge: null, dealLabel: null, marketSavings: 0,
    features: ['Uconnect 4','Apple CarPlay / Android Auto','Leather-Trimmed Seats',
      'Heated Front Seats','Power Liftgate','Blind Spot Monitoring',
      'Rear Cross Path Detection','ParkView Camera','AWD','Third-Row Seating'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Three rows, V6 power, and AWD — the Durango GT is the family hauler that doesn\'t feel like a compromise.',
    location: 'Arvada, CO'
  },
  {
    id: 24, stockNum: 'DC10024', vin: '2C3CCABG5LH901234',
    year: 2020, make: 'Chrysler', model: '300', trim: 'Touring L',
    body: 'Sedan', extColor: 'Bright White Clearcoat', intColor: 'Black',
    price: 22988, mileage: 38900, mpgCity: 19, mpgHwy: 30,
    engine: '3.6L V6', hp: 292,
    transmission: '8-Speed Automatic', drivetrain: 'RWD',
    owners: 1, accidentFree: true,
    dealBadge: 'priced-to-sell', dealLabel: 'Priced to Sell', marketSavings: 800,
    features: ['Uconnect 4','Apple CarPlay / Android Auto','Leather-Trimmed Seats',
      'Heated Front Seats','Dual-Zone Climate','Blind Spot Monitoring',
      'ParkSense Rear Park Assist','Backup Camera','Keyless Enter-N-Go','LED Fog Lamps'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Full-size American sedan comfort with a surprisingly refined interior. The 300 Touring L is a lot of car for the money.',
    location: 'Denver, CO'
  },
  {
    id: 25, stockNum: 'DC10025', vin: 'JA4J4VA89NZ012345',
    year: 2021, make: 'Mitsubishi', model: 'Outlander', trim: 'SEL',
    body: 'SUV', extColor: 'Labrador Black Pearl', intColor: 'Black',
    price: 24990, mileage: 27600, mpgCity: 24, mpgHwy: 30,
    engine: '2.5L 4-Cylinder', hp: 181,
    transmission: 'CVT Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 1300,
    features: ['8" Smartphone-Link Display','Apple CarPlay / Android Auto','Leather-Appointed Seats',
      'Heated Front Seats','Power Liftgate','MI-PILOT Assist',
      'Blind Spot Warning','Rear Cross Traffic Alert','AWD','Third-Row Seating'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Strong value in the compact SUV class — three rows, AWD, and a long warranty pedigree make this Outlander SEL a smart pick.',
    location: 'Lakewood, CO'
  },
  {
    id: 26, stockNum: 'DC10026', vin: 'YV4A22PK2M1123456',
    year: 2021, make: 'Volvo', model: 'XC60', trim: 'T5 Momentum',
    body: 'SUV', extColor: 'Crystal White Pearl', intColor: 'Charcoal',
    price: 36990, mileage: 25400, mpgCity: 22, mpgHwy: 28,
    engine: '2.0L Turbocharged 4-Cyl', hp: 250,
    transmission: '8-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 2700,
    features: ['Sensus Connect','Apple CarPlay / Android Auto','Leather Seating',
      'Heated Front Seats','Power Tailgate','City Safety Collision Avoidance',
      'Pilot Assist','BLIS Blind Spot','AWD','Panoramic Sunroof'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Scandinavian design meets serious safety tech. The XC60 is one of the most comfortable and confident SUVs in its class.',
    location: 'Boulder, CO'
  },
  {
    id: 27, stockNum: 'DC10027', vin: 'KMUHCESC5NU234567',
    year: 2022, make: 'Genesis', model: 'GV70', trim: '2.5T Select',
    body: 'SUV', extColor: 'Uyuni White', intColor: 'Black',
    price: 39490, mileage: 19200, mpgCity: 21, mpgHwy: 26,
    engine: '2.5L Turbocharged 4-Cyl', hp: 300,
    transmission: '8-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'low-miles', dealLabel: 'Low Miles', marketSavings: 3200,
    features: ['Genesis Connected Services','Apple CarPlay / Android Auto','Leather Seating',
      'Heated & Ventilated Front Seats','Power Liftgate','Highway Driving Assist II',
      'Blind-Spot Collision Avoidance','Lexicon Premium Audio','AWD','Panoramic Sunroof'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Genesis punches above its weight — near-luxury materials, strong turbo performance, and a warranty that beats most of the segment.',
    location: 'Denver, CO'
  },
  {
    id: 28, stockNum: 'DC10028', vin: '1GYKNCRS5LZ345678',
    year: 2020, make: 'Cadillac', model: 'XT5', trim: 'Premium Luxury',
    body: 'SUV', extColor: 'Stellar Black Metallic', intColor: 'Jet Black',
    price: 33490, mileage: 36700, mpgCity: 22, mpgHwy: 29,
    engine: '2.0L Turbocharged 4-Cyl', hp: 237,
    transmission: '9-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'hot-deal', dealLabel: 'Hot Deal', marketSavings: 2000,
    features: ['Cadillac User Experience','Apple CarPlay / Android Auto','Leather Seating',
      'Heated Front Seats','Hands-Free Liftgate','Automatic Emergency Braking',
      'Rear Park Assist','Bose Premium Audio','AWD','Power Sunroof'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'American luxury with everyday usability. The XT5 Premium Luxury trim adds the features buyers expect without the new-car sticker shock.',
    location: 'Englewood, CO'
  },
  {
    id: 29, stockNum: 'DC10029', vin: '5LMCJ2D99MUL456789',
    year: 2021, make: 'Lincoln', model: 'Corsair', trim: 'Reserve',
    body: 'SUV', extColor: 'Infinite Black', intColor: 'Ebony',
    price: 34490, mileage: 26100, mpgCity: 22, mpgHwy: 28,
    engine: '2.0L Turbocharged 4-Cyl', hp: 250,
    transmission: '8-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 2300,
    features: ['SYNC 3','Apple CarPlay / Android Auto','Leather Seating',
      'Heated & Ventilated Front Seats','Power Liftgate','Co-Pilot360 Plus',
      'Adaptive Cruise Control','Revel Premium Audio','AWD','Panoramic Vista Roof'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Quiet, comfortable, and well-equipped — the Corsair Reserve brings Lincoln\'s premium feel to the compact luxury SUV space.',
    location: 'Fort Collins, CO'
  },
  {
    id: 30, stockNum: 'DC10030', vin: '1C6SRFFT5MN567890',
    year: 2021, make: 'Ram', model: '1500', trim: 'Big Horn',
    body: 'Truck', extColor: 'Granite Crystal Metallic', intColor: 'Black',
    price: 38490, mileage: 33500, mpgCity: 17, mpgHwy: 25,
    engine: '3.6L Pentastar V6 eTorque', hp: 305,
    transmission: '8-Speed Automatic', drivetrain: '4WD',
    owners: 1, accidentFree: true,
    dealBadge: null, dealLabel: null, marketSavings: 0,
    features: ['Uconnect 5','Apple CarPlay / Android Auto','Cloth/Vinyl Bench Seat',
      'Heated Front Seats','Bed Utility Group','Blind Spot Monitoring',
      'Rear Park Assist','Class-Exclusive Air Suspension','4WD','Spray-In Bedliner'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Ram\'s ride quality leads the full-size truck class. This Big Horn 4WD is ready for work, towing, or weekend adventures.',
    location: 'Colorado Springs, CO'
  },
  {
    id: 31, stockNum: 'DC10031', vin: 'WMWXT3C05M2678901',
    year: 2020, make: 'MINI', model: 'Countryman', trim: 'S ALL4',
    body: 'SUV', extColor: 'Chili Red', intColor: 'Carbon Black',
    price: 26490, mileage: 34500, mpgCity: 23, mpgHwy: 31,
    engine: '2.0L Turbocharged 4-Cyl', hp: 189,
    transmission: '8-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'priced-to-sell', dealLabel: 'Priced to Sell', marketSavings: 700,
    features: ['MINI Connected','Apple CarPlay / Android Auto','Leatherette Seating',
      'Heated Front Seats','Power Tailgate','Active Driving Assistant',
      'Parking Assistant','ALL4 AWD','Panoramic Sunroof','Sport Suspension'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Fun to drive and easy to park — the Countryman S ALL4 adds AWD grip and MINI personality to a versatile crossover body.',
    location: 'Denver, CO'
  },
  {
    id: 32, stockNum: 'DC10032', vin: '1FA6P8TH5M5123456',
    year: 2021, make: 'Ford', model: 'Mustang', trim: 'EcoBoost',
    body: 'Coupe', extColor: 'Race Red', intColor: 'Ebony',
    price: 28990, mileage: 22400, mpgCity: 21, mpgHwy: 32,
    engine: '2.3L EcoBoost Turbocharged 4-Cyl', hp: 310,
    transmission: '10-Speed Automatic', drivetrain: 'RWD',
    owners: 1, accidentFree: true,
    dealBadge: 'hot-deal', dealLabel: 'Hot Deal', marketSavings: 1800,
    features: ['SYNC 3','Apple CarPlay / Android Auto','Dual-Zone Climate',
      'Heated Front Seats','Rear Spoiler','Track Apps',
      'Blind Spot Information System','Backup Camera','Keyless Entry','LED Headlamps'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Iconic Mustang styling with turbo efficiency — this EcoBoost delivers sharp handling and everyday livability without the V8 fuel bill.',
    location: 'Denver, CO'
  },
  {
    id: 33, stockNum: 'DC10033', vin: '3VW5T7AU5MM678901',
    year: 2021, make: 'Volkswagen', model: 'Golf', trim: 'SE',
    body: 'Hatchback', extColor: 'Pure White', intColor: 'Titan Black',
    price: 21990, mileage: 28700, mpgCity: 29, mpgHwy: 37,
    engine: '1.4L Turbocharged 4-Cyl', hp: 147,
    transmission: '8-Speed Automatic', drivetrain: 'FWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 950,
    features: ['Digital Cockpit','App-Connect (CarPlay/Android)','V-Tex Leatherette',
      'Heated Front Seats','Adaptive Cruise Control','Blind Spot Monitor',
      'Rear Traffic Alert','Automatic Emergency Braking','Keyless Access','Split-Folding Rear Seat'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'The Golf hatchback is the ultimate city car — easy to park, great on gas, and surprisingly upscale inside for the price.',
    location: 'Boulder, CO'
  },
  {
    id: 34, stockNum: 'DC10034', vin: '19XFL2H89ME890123',
    year: 2022, make: 'Honda', model: 'Civic', trim: 'Sport Hatchback',
    body: 'Hatchback', extColor: 'Sonic Gray Pearl', intColor: 'Black',
    price: 26490, mileage: 19800, mpgCity: 29, mpgHwy: 37,
    engine: '2.0L 4-Cylinder', hp: 158,
    transmission: 'CVT Automatic', drivetrain: 'FWD',
    owners: 1, accidentFree: true,
    dealBadge: 'low-miles', dealLabel: 'Low Miles', marketSavings: 1400,
    features: ['7" Display Audio','Apple CarPlay / Android Auto','Honda Sensing',
      'Heated Front Seats','Dual-Zone Climate','Sport Pedals',
      'Lane Keeping Assist','Adaptive Cruise Control','Backup Camera','60/40 Split Rear Seat'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Low miles, Honda reliability, and hatchback utility — the Civic Sport Hatchback is a smart pick for commuters who need cargo flexibility.',
    location: 'Aurora, CO'
  },
  {
    id: 35, stockNum: 'DC10035', vin: '5FNRL6H74LB012345',
    year: 2020, make: 'Honda', model: 'Odyssey', trim: 'EX-L',
    body: 'Minivan', extColor: 'Modern Steel Metallic', intColor: 'Gray',
    price: 31990, mileage: 41200, mpgCity: 19, mpgHwy: 28,
    engine: '3.5L V6', hp: 280,
    transmission: '10-Speed Automatic', drivetrain: 'FWD',
    owners: 1, accidentFree: true,
    dealBadge: 'priced-to-sell', dealLabel: 'Priced to Sell', marketSavings: 1100,
    features: ['Honda Sensing','Apple CarPlay / Android Auto','Leather-Trimmed Seats',
      'Heated Front Seats','Power Sliding Doors','Magic Slide 2nd Row',
      'Blind Spot Information','Cross Traffic Monitor','Rear Entertainment Ready','8-Passenger Seating'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'The family hauler that doesn\'t feel like a compromise — Magic Slide seats, Honda Sensing, and room for everyone plus gear.',
    location: 'Littleton, CO'
  },
  {
    id: 36, stockNum: 'DC10036', vin: '2T3C1RFV8MC234567',
    year: 2021, make: 'Toyota', model: 'Sienna', trim: 'XLE',
    body: 'Minivan', extColor: 'Celestial Silver Metallic', intColor: 'Gray',
    price: 36490, mileage: 26800, mpgCity: 36, mpgHwy: 36,
    engine: '2.5L Hybrid 4-Cyl', hp: 245,
    transmission: 'eCVT', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 2400,
    features: ['Toyota Safety Sense 2.0','Apple CarPlay / Android Auto','Leather-Trimmed Seats',
      'Heated Front Seats','Power Sliding Doors','Kick-Open Power Liftgate',
      'Blind Spot Monitor','360° Camera','Hybrid AWD','7-Passenger Seating'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Hybrid efficiency meets minivan practicality — the Sienna XLE AWD is the modern family road-trip machine.',
    location: 'Westminster, CO'
  },
  {
    id: 37, stockNum: 'DC10037', vin: 'WAUENAF40MN001234',
    year: 2023, make: 'Audi', model: 'A4', trim: 'Premium Plus quattro',
    body: 'Sedan', extColor: 'Manhattan Gray Metallic', intColor: 'Black',
    price: 42990, mileage: 18400, mpgCity: 24, mpgHwy: 31,
    engine: '2.0L Turbocharged 4-Cyl', hp: 261,
    transmission: '7-Speed Dual-Clutch Auto', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: null, dealLabel: null, marketSavings: 0,
    features: ['Audi Virtual Cockpit','Apple CarPlay / Android Auto','quattro AWD',
      'Heated Front Seats','Lane Departure Warning','Audi Pre Sense Front',
      'Bang & Olufsen Audio','Adaptive Cruise Control','LED Headlights','Sunroof'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'This 2023 Audi A4 Premium Plus quattro pairs a refined cabin with composed all-weather grip. Factory warranty still active — a strong fit for European AWD sedan shoppers.',
    location: 'Boulder, CO'
  },
  {
    id: 38, stockNum: 'DC10038', vin: '3MW5R1J08N8B567890',
    year: 2022, make: 'BMW', model: '330i', trim: 'xDrive Sport Line',
    body: 'Sedan', extColor: 'Alpine White', intColor: 'Black',
    price: 39850, mileage: 24100, mpgCity: 26, mpgHwy: 36,
    engine: '2.0L Turbocharged 4-Cyl', hp: 255,
    transmission: '8-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 1800,
    features: ['BMW Live Cockpit Pro','Apple CarPlay / Android Auto','xDrive AWD',
      'Sport Front Seats','Heated Front Seats','Parking Assistant Plus',
      'Active Driving Assistant','Harman/Kardon Audio','Adaptive Cruise Control','Sunroof'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'The driver\'s pick in the class — sharp handling, xDrive traction, and priced below comparable listings. Factory warranty active.',
    location: 'Denver, CO'
  },
  {
    id: 39, stockNum: 'DC10039', vin: 'YV4H60DZ5P2123456',
    year: 2023, make: 'Volvo', model: 'S60', trim: 'B5 Plus',
    body: 'Sedan', extColor: 'Crystal White Pearl', intColor: 'Charcoal',
    price: 38500, mileage: 15900, mpgCity: 26, mpgHwy: 35,
    engine: '2.0L Turbo + Mild Hybrid', hp: 247,
    transmission: '8-Speed Automatic', drivetrain: 'AWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 900,
    features: ['Google built-in','Apple CarPlay / Android Auto','Pilot Assist',
      'Heated Front Seats','City Safety Collision Avoidance','BLIS Blind Spot',
      'Harman/Kardon Audio','Adaptive Cruise Control','AWD','Panoramic Sunroof'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Standout safety scores and a calm, upscale cabin. The mild-hybrid B5 AWD is smooth, efficient, and quietly quick — lowest price on many shortlists.',
    location: 'Fort Collins, CO'
  },
  {
    id: 40, stockNum: 'DC10040', vin: '1G1Y72D45M5101234',
    year: 2022, make: 'Chevrolet', model: 'Corvette', trim: 'Stingray 1LT',
    body: 'Coupe', extColor: 'Arctic White', intColor: 'Jet Black',
    price: 68990, mileage: 12400, mpgCity: 16, mpgHwy: 24,
    engine: '6.2L V8 LT2', hp: 495,
    transmission: '8-Speed Dual-Clutch Auto', drivetrain: 'RWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 3200,
    features: ['12" Digital Cluster','Apple CarPlay / Android Auto','Performance Data Recorder',
      'GT1 Bucket Seats','Rear Vision Camera','Magnetic Ride Control',
      'Brembo Brakes','Launch Control','Keyless Open & Start','LED Headlamps'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Mid-engine C8 Stingray with only 12,400 miles — 495 hp, magnetic ride, and the weekend-car drama you were picturing. One owner, clean history, ready for Sunday back roads.',
    location: 'Denver, CO'
  },
  {
    id: 41, stockNum: 'DC10041', vin: '1G1Y72D47P3123456',
    year: 2023, make: 'Chevrolet', model: 'Corvette', trim: 'Stingray 1LT',
    body: 'Coupe', extColor: 'Hypersonic Gray Metallic', intColor: 'Jet Black',
    price: 72990, mileage: 10500, mpgCity: 16, mpgHwy: 24,
    engine: '6.2L V8 LT2', hp: 495,
    transmission: '8-Speed Dual-Clutch Auto', drivetrain: 'RWD',
    owners: 1, accidentFree: true,
    dealBadge: 'great-deal', dealLabel: 'Great Deal', marketSavings: 2100,
    features: ['12" Digital Cluster','Wireless Apple CarPlay / Android Auto','Performance Data Recorder',
      'GT1 Bucket Seats','Magnetic Ride Control','Rear Vision Camera',
      'Brembo Brakes','Launch Control','Keyless Open & Start','LED Headlamps'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'One-owner 2023 Stingray 1LT — same 495 hp LT2 V8 with wireless CarPlay added mid-cycle. Magnetic ride, low miles, and a sweet spot between early 2022 pricing and 2024 2LT premiums.',
    location: 'Aurora, CO'
  },
  {
    id: 42, stockNum: 'DC10042', vin: '1G1Y72D48R5123456',
    year: 2024, make: 'Chevrolet', model: 'Corvette', trim: 'Stingray 2LT',
    body: 'Coupe', extColor: 'Torch Red', intColor: 'Jet Black/Natural',
    price: 78490, mileage: 8200, mpgCity: 16, mpgHwy: 24,
    engine: '6.2L V8 LT2', hp: 495,
    transmission: '8-Speed Dual-Clutch Auto', drivetrain: 'RWD',
    owners: 1, accidentFree: true,
    dealBadge: null, dealLabel: null, marketSavings: 0,
    features: ['Wireless Apple CarPlay / Android Auto','12" Digital Cluster','Head-Up Display',
      'GT2 Bucket Seats','Front Lift','Magnetic Ride Control','Performance Data Recorder',
      'Brembo Brakes','Launch Control','Heated Steering Wheel','Front Camera Lift System'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Nearly new 2024 Stingray 2LT — same 495 hp LT2 V8 as earlier C8s, but with the revised interior, wireless CarPlay, and 2LT comfort upgrades. Low miles, one owner.',
    location: 'Plano, TX'
  },
  {
    id: 43, stockNum: 'DC10043', vin: '1G1Y72D48R5012345',
    year: 2024, make: 'Chevrolet', model: 'Corvette', trim: 'Stingray 2LT',
    body: 'Coupe', extColor: 'Arctic White', intColor: 'Jet Black/Natural',
    condition: 'new',
    price: 82490, mileage: 18, mpgCity: 16, mpgHwy: 24,
    engine: '6.2L V8 LT2', hp: 495,
    transmission: '8-Speed Dual-Clutch Auto', drivetrain: 'RWD',
    owners: 0, accidentFree: true,
    dealBadge: null, dealLabel: null, marketSavings: 0,
    features: ['Wireless Apple CarPlay / Android Auto','12" Digital Cluster','Head-Up Display',
      'GT2 Bucket Seats','Front Lift','Magnetic Ride Control','Performance Data Recorder',
      'Brembo Brakes','Launch Control','Heated Steering Wheel','Front Camera Lift System'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Brand-new 2024 Corvette Stingray 2LT — delivery miles only, full factory warranty, revised C8 interior with wireless CarPlay and GT2 seats. Ready for your first Sunday drive.',
    location: 'Denver, CO'
  },
  {
    id: 44, stockNum: 'DC10044', vin: '1G1Y72D49S6123456',
    year: 2026, make: 'Chevrolet', model: 'Corvette', trim: 'Stingray 2LT',
    body: 'Coupe', extColor: 'Caffeine Metallic', intColor: 'Jet Black/Natural',
    condition: 'new',
    price: 84990, mileage: 12, mpgCity: 16, mpgHwy: 24,
    engine: '6.2L V8 LT2', hp: 495,
    transmission: '8-Speed Dual-Clutch Auto', drivetrain: 'RWD',
    owners: 0, accidentFree: true,
    dealBadge: null, dealLabel: null, marketSavings: 0,
    features: ['Wireless Apple CarPlay / Android Auto','12" Digital Cluster','Head-Up Display',
      'GT2 Bucket Seats','Front Lift','Magnetic Ride Control','Performance Data Recorder',
      'Brembo Brakes','Launch Control','Heated Steering Wheel','Z51 Performance Package'],
    images: [SKETCH_IMG, SKETCH_IMG, SKETCH_IMG],
    description: 'Brand-new 2026 Corvette Stingray 2LT on the lot — delivery miles only, full factory warranty, Z51 performance package. The latest C8 interior and tech, ready for your first Sunday drive.',
    location: 'Denver, CO'
  }
];

// Expand the seed catalog into a full lot for the SRP — duplicates templates
// with unique ids, stock numbers, and light price/mileage variation.
const LOT_LOCATIONS = [
  'Dallas, TX', 'Fort Worth, TX', 'Plano, TX', 'Irving, TX',
  'Arlington, TX', 'Frisco, TX', 'Garland, TX', 'McKinney, TX',
  'Carrollton, TX', 'Richardson, TX',
];

const COPIES_PER_VEHICLE = 10;

function expandInventory(templates, copiesPerTemplate) {
  const out = [];
  let nextId = 1;
  templates.forEach((tpl, ti) => {
    for (let copy = 0; copy < copiesPerTemplate; copy++) {
      const stockIdx = 10001 + ti * copiesPerTemplate + copy;
      const mileageBump = copy * 1100 + (ti % 4) * 350;
      const priceSwing = (copy % 6) * 200 - 400;
      out.push({
        ...tpl,
        id: nextId++,
        stockNum: 'DC' + stockIdx,
        vin: tpl.vin.slice(0, 12) + String(copy).padStart(5, '0'),
        mileage: tpl.condition === 'new'
          ? Math.max(3, tpl.mileage + copy * 6)
          : Math.max(8000, tpl.mileage + mileageBump - 1500),
        price: Math.max(16000, tpl.price + priceSwing),
        location: tpl.location || LOT_LOCATIONS[(ti + copy) % LOT_LOCATIONS.length],
        pinLocation: !!tpl.location,
        features: tpl.features.slice(),
        images: tpl.images.slice(),
      });
    }
  });
  return out;
}

const VEHICLES = expandInventory(BASE_VEHICLES, COPIES_PER_VEHICLE);

function getVehicleById(id) {
  return VEHICLES.find(v => v.id === parseInt(id));
}

// Resolve a homepage pick to an inventory row for VDP linking only.
// Display copy comes from profile.js — this is optional glue.
function findVehicleForPick(pick) {
  if (!pick) return null;
  if (pick.vdpId != null) {
    const byId = getVehicleById(pick.vdpId);
    if (byId) return byId;
  }
  let year = pick.year;
  let make = pick.make;
  let model = pick.model;
  if ((!make || !model) && pick.name) {
    const m = String(pick.name).match(/^(\d{4})\s+([A-Za-z][A-Za-z-]*)\s+(\S+)/);
    if (m) {
      year = year || parseInt(m[1], 10);
      make = make || m[2];
      model = model || m[3];
    }
  }
  if (!make && !model) return null;
  let pool = VEHICLES.filter(v => {
    if (year && v.year !== year) return false;
    if (make && v.make.toLowerCase() !== String(make).toLowerCase()) return false;
    if (model && !v.model.toLowerCase().startsWith(String(model).toLowerCase())) return false;
    if (pick.trim && !v.trim.toLowerCase().includes(String(pick.trim).toLowerCase())) return false;
    return true;
  });
  if (!pool.length) return null;
  if (pick.location) {
    const atLoc = pool.filter(v => v.location === pick.location);
    if (atLoc.length) pool = atLoc;
  }
  if (typeof Profile !== 'undefined' && Profile.primaryLotCity) {
    const primary = Profile.primaryLotCity();
    if (primary) {
      const local = pool.filter(v => v.location === primary);
      if (local.length) pool = local;
    }
  }
  return pool.slice().sort((a, b) => a.mileage - b.mileage)[0];
}

function formatPrice(n) {
  return '$' + Number(n).toLocaleString('en-US');
}

function formatMileage(n) {
  return Number(n).toLocaleString('en-US') + ' mi';
}

function calcMonthly(price, down = 0, annualRate = 6.9, months = 60) {
  const principal = price - down;
  if (principal <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return Math.round(principal / months);
  const m = principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  return Math.round(m);
}
