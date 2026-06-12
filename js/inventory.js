// Study mode: one generic car sketch for every vehicle so the image never
// reveals the actual body type during participant interviews.
const SKETCH_IMG = 'https://plus.unsplash.com/premium_vector-1733984597729-fad43b660da0?fm=jpg&q=60&w=900&auto=format&fit=crop';

const VEHICLES = [
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
  }
];

function getVehicleById(id) {
  return VEHICLES.find(v => v.id === parseInt(id));
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
