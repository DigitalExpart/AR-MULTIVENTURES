# AR Multiventures — Master Data Onboarding Templates
**Version:** 9.0  
**Date:** 2026-08-26  
**Format:** UTF-8 CSV / Excel Spreadsheet Specifications  

---

## 1. Customers Master Import Template (`customers.csv`)

```csv
company_name,rc_number,tax_id,contact_person,phone,email,address,credit_limit_ngn,payment_terms_days
BuildCorp Nigeria Limited,RC-119284,TIN-88912344,Engr. Babatunde Alabi,+2348031234567,procurement@buildcorp.ng,"Plot 4, Lekki Phase 1, Lagos",25000000,14
Julius Berger Site Operations,RC-004412,TIN-11002244,Alhaji Aminu Bello,+2348059876543,logistics@juliusberger.ng,"Epe Flyover Base Camp, Lagos",50000000,30
Dangote Construction Lekki,RC-889211,TIN-99882211,Mr. Segun Olatunji,+2348021122334,materials@dangote.com,"Refinery Complex Site, Lekki, Lagos",100000000,45
```

---

## 2. Quarries Master Import Template (`quarries.csv`)

```csv
quarry_name,code,state,lga,address,latitude,longitude,daily_capacity_tonnes
Abeokuta North High-Grade Quarry,QRY-ABK,Ogun,Abeokuta North,"Aiyetoro Road, Abeokuta",7.1475,3.3619,5000
Sagamu Interchange Quarry,QRY-SGM,Ogun,Sagamu,"KM 42, Lagos-Ibadan Expressway, Sagamu",6.8482,3.6465,3500
Ibadan South Quarry Hub,QRY-IBD,Oyo,Oluyole,"Old Lagos-Ibadan Road, Ibadan",7.2831,3.8741,2500
```

---

## 3. Materials Master Import Template (`materials.csv`)

```csv
material_name,code,aggregate_size,description,unit_of_measure
Granite 3/4 Inch (20mm Aggregate),MAT-G20,20mm,Standard high-strength concrete aggregate,tonnes
Granite 1/2 Inch (12mm Aggregate),MAT-G12,12mm,Fine precast and flooring aggregate,tonnes
Granite 1 Inch (25mm Aggregate),MAT-G25,25mm,Mass foundation and civil work stone,tonnes
Stone Base Material,MAT-BASE,0-40mm,Graded crushed stone road base material,tonnes
Granite Dust (Stone Powder),MAT-DUST,0-5mm,Asphalt filler and interlock casting dust,tonnes
Hardcore Boulder Stone,MAT-HARD,150-300mm,Heavy foundation rock and erosion embankment,tonnes
```

---

## 4. Material Pit-Head Pricing Template (`material_prices.csv`)

```csv
quarry_code,material_code,price_per_tonne_ngn,effective_date,notes
QRY-ABK,MAT-G20,12000.00,2026-08-01,Standard commercial rate
QRY-ABK,MAT-G12,13000.00,2026-08-01,Standard commercial rate
QRY-SGM,MAT-G20,11800.00,2026-08-01,Sagamu pit-head rate
QRY-SGM,MAT-BASE,10500.00,2026-08-01,Road construction grade
```

---

## 5. Haulage Corridor Freight Tariffs Template (`haulage_tariffs.csv`)

```csv
quarry_code,destination_name,truck_type,corridor_tariff_ngn,distance_km
QRY-ABK,Dangote Refinery Complex Site Lekki,HEAVY_TIPPER_30T,150000.00,145
QRY-SGM,Epe Expressway Flyover Site,HEAVY_TIPPER_30T,135000.00,85
QRY-ABK,Ikeja Commercial Development,HEAVY_TIPPER_30T,135000.00,95
QRY-SGM,Sagamu Industrial Park,HEAVY_TIPPER_30T,50000.00,18
```

---

## 6. Trucks Registry Template (`trucks.csv`)

```csv
registration_number,truck_type,capacity_tonnes,ownership_type,make,model,year,chassis_number,insurance_expiry,roadworthiness_expiry
KJA-104-XA,HEAVY_TIPPER_30T,30.00,COMPANY,Mack,Granite 400,2021,1M8GR4489MB102941,2027-04-30,2027-05-15
LSR-492-YY,HEAVY_TIPPER_30T,30.00,COMPANY,Sinotruk,HOWO 371,2022,ZZ3257N3847D1104,2027-06-30,2027-07-15
APP-883-ZZ,HEAVY_TIPPER_30T,30.00,COMPANY,Mercedes,Actros 3340,2020,WDB9540321K882914,2027-03-31,2027-04-30
EKY-712-BC,HEAVY_TIPPER_30T,30.00,CONTRACTOR,MAN,TGS 33.400,2019,WMA33WZZ9KM991823,2026-11-30,2026-12-15
```

---

## 7. Certified Drivers Master Template (`drivers.csv`)

```csv
first_name,last_name,phone_number,license_number,license_category,license_expiry,emergency_contact_name,emergency_contact_phone
Ibrahim,Musa,+2348031112233,FRSC-DL-00918244,CLASS_E,2027-11-14,Amina Musa (Wife),+2348039988776
Babatunde,Adeleke,+2348052223344,FRSC-DL-11094821,CLASS_E,2028-02-28,Folake Adeleke (Wife),+2348058877665
Chinedu,Okonkwo,+2348027778899,FRSC-DL-99482103,CLASS_E,2027-09-30,Ngozi Okonkwo (Wife),+2348023344556
```
