import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
const h = (pw: string) => bcrypt.hash(pw, 12);

// 300 real Bangladesh constituencies: [number, nameBn, nameEn, division, district]
const CONSTITUENCIES: [number, string, string, string, string][] = [
  [1,'পঞ্চগড়-১','Panchagarh-1','Rangpur','Panchagarh'],
  [2,'পঞ্চগড়-২','Panchagarh-2','Rangpur','Panchagarh'],
  [3,'ঠাকুরগাঁও-১','Thakurgaon-1','Rangpur','Thakurgaon'],
  [4,'ঠাকুরগাঁও-২','Thakurgaon-2','Rangpur','Thakurgaon'],
  [5,'ঠাকুরগাঁও-৩','Thakurgaon-3','Rangpur','Thakurgaon'],
  [6,'দিনাজপুর-১','Dinajpur-1','Rangpur','Dinajpur'],
  [7,'দিনাজপুর-২','Dinajpur-2','Rangpur','Dinajpur'],
  [8,'দিনাজপুর-৩','Dinajpur-3','Rangpur','Dinajpur'],
  [9,'দিনাজপুর-৪','Dinajpur-4','Rangpur','Dinajpur'],
  [10,'দিনাজপুর-৫','Dinajpur-5','Rangpur','Dinajpur'],
  [11,'দিনাজপুর-৬','Dinajpur-6','Rangpur','Dinajpur'],
  [12,'নীলফামারী-১','Nilphamari-1','Rangpur','Nilphamari'],
  [13,'নীলফামারী-২','Nilphamari-2','Rangpur','Nilphamari'],
  [14,'নীলফামারী-৩','Nilphamari-3','Rangpur','Nilphamari'],
  [15,'নীলফামারী-৪','Nilphamari-4','Rangpur','Nilphamari'],
  [16,'লালমনিরহাট-১','Lalmonirhat-1','Rangpur','Lalmonirhat'],
  [17,'লালমনিরহাট-২','Lalmonirhat-2','Rangpur','Lalmonirhat'],
  [18,'লালমনিরহাট-৩','Lalmonirhat-3','Rangpur','Lalmonirhat'],
  [19,'রংপুর-১','Rangpur-1','Rangpur','Rangpur'],
  [20,'রংপুর-২','Rangpur-2','Rangpur','Rangpur'],
  [21,'রংপুর-৩','Rangpur-3','Rangpur','Rangpur'],
  [22,'রংপুর-৪','Rangpur-4','Rangpur','Rangpur'],
  [23,'রংপুর-৫','Rangpur-5','Rangpur','Rangpur'],
  [24,'রংপুর-৬','Rangpur-6','Rangpur','Rangpur'],
  [25,'কুড়িগ্রাম-১','Kurigram-1','Rangpur','Kurigram'],
  [26,'কুড়িগ্রাম-২','Kurigram-2','Rangpur','Kurigram'],
  [27,'কুড়িগ্রাম-৩','Kurigram-3','Rangpur','Kurigram'],
  [28,'কুড়িগ্রাম-৪','Kurigram-4','Rangpur','Kurigram'],
  [29,'গাইবান্ধা-১','Gaibandha-1','Rangpur','Gaibandha'],
  [30,'গাইবান্ধা-২','Gaibandha-2','Rangpur','Gaibandha'],
  [31,'গাইবান্ধা-৩','Gaibandha-3','Rangpur','Gaibandha'],
  [32,'গাইবান্ধা-৪','Gaibandha-4','Rangpur','Gaibandha'],
  [33,'গাইবান্ধা-৫','Gaibandha-5','Rangpur','Gaibandha'],
  [34,'জয়পুরহাট-১','Joypurhat-1','Rajshahi','Joypurhat'],
  [35,'জয়পুরহাট-২','Joypurhat-2','Rajshahi','Joypurhat'],
  [36,'বগুড়া-১','Bogura-1','Rajshahi','Bogura'],
  [37,'বগুড়া-২','Bogura-2','Rajshahi','Bogura'],
  [38,'বগুড়া-৩','Bogura-3','Rajshahi','Bogura'],
  [39,'বগুড়া-৪','Bogura-4','Rajshahi','Bogura'],
  [40,'বগুড়া-৫','Bogura-5','Rajshahi','Bogura'],
  [41,'বগুড়া-৬','Bogura-6','Rajshahi','Bogura'],
  [42,'বগুড়া-৭','Bogura-7','Rajshahi','Bogura'],
  [43,'চাঁপাইনবাবগঞ্জ-১','Chapainawabganj-1','Rajshahi','Chapainawabganj'],
  [44,'চাঁপাইনবাবগঞ্জ-২','Chapainawabganj-2','Rajshahi','Chapainawabganj'],
  [45,'চাঁপাইনবাবগঞ্জ-৩','Chapainawabganj-3','Rajshahi','Chapainawabganj'],
  [46,'নওগাঁ-১','Naogaon-1','Rajshahi','Naogaon'],
  [47,'নওগাঁ-২','Naogaon-2','Rajshahi','Naogaon'],
  [48,'নওগাঁ-৩','Naogaon-3','Rajshahi','Naogaon'],
  [49,'নওগাঁ-৪','Naogaon-4','Rajshahi','Naogaon'],
  [50,'নওগাঁ-৫','Naogaon-5','Rajshahi','Naogaon'],
  [51,'নওগাঁ-৬','Naogaon-6','Rajshahi','Naogaon'],
  [52,'রাজশাহী-১','Rajshahi-1','Rajshahi','Rajshahi'],
  [53,'রাজশাহী-২','Rajshahi-2','Rajshahi','Rajshahi'],
  [54,'রাজশাহী-৩','Rajshahi-3','Rajshahi','Rajshahi'],
  [55,'রাজশাহী-৪','Rajshahi-4','Rajshahi','Rajshahi'],
  [56,'রাজশাহী-৫','Rajshahi-5','Rajshahi','Rajshahi'],
  [57,'রাজশাহী-৬','Rajshahi-6','Rajshahi','Rajshahi'],
  [58,'নাটোর-১','Natore-1','Rajshahi','Natore'],
  [59,'নাটোর-২','Natore-2','Rajshahi','Natore'],
  [60,'নাটোর-৩','Natore-3','Rajshahi','Natore'],
  [61,'নাটোর-৪','Natore-4','Rajshahi','Natore'],
  [62,'সিরাজগঞ্জ-১','Sirajganj-1','Rajshahi','Sirajganj'],
  [63,'সিরাজগঞ্জ-২','Sirajganj-2','Rajshahi','Sirajganj'],
  [64,'সিরাজগঞ্জ-৩','Sirajganj-3','Rajshahi','Sirajganj'],
  [65,'সিরাজগঞ্জ-৪','Sirajganj-4','Rajshahi','Sirajganj'],
  [66,'সিরাজগঞ্জ-৫','Sirajganj-5','Rajshahi','Sirajganj'],
  [67,'সিরাজগঞ্জ-৬','Sirajganj-6','Rajshahi','Sirajganj'],
  [68,'পাবনা-১','Pabna-1','Rajshahi','Pabna'],
  [69,'পাবনা-২','Pabna-2','Rajshahi','Pabna'],
  [70,'পাবনা-৩','Pabna-3','Rajshahi','Pabna'],
  [71,'পাবনা-৪','Pabna-4','Rajshahi','Pabna'],
  [72,'পাবনা-৫','Pabna-5','Rajshahi','Pabna'],
  [73,'মেহেরপুর-১','Meherpur-1','Khulna','Meherpur'],
  [74,'মেহেরপুর-২','Meherpur-2','Khulna','Meherpur'],
  [75,'কুষ্টিয়া-১','Kushtia-1','Khulna','Kushtia'],
  [76,'কুষ্টিয়া-২','Kushtia-2','Khulna','Kushtia'],
  [77,'কুষ্টিয়া-৩','Kushtia-3','Khulna','Kushtia'],
  [78,'কুষ্টিয়া-৪','Kushtia-4','Khulna','Kushtia'],
  [79,'চুয়াডাঙ্গা-১','Chuadanga-1','Khulna','Chuadanga'],
  [80,'চুয়াডাঙ্গা-২','Chuadanga-2','Khulna','Chuadanga'],
  [81,'ঝিনাইদহ-১','Jhenaidah-1','Khulna','Jhenaidah'],
  [82,'ঝিনাইদহ-২','Jhenaidah-2','Khulna','Jhenaidah'],
  [83,'ঝিনাইদহ-৩','Jhenaidah-3','Khulna','Jhenaidah'],
  [84,'ঝিনাইদহ-৪','Jhenaidah-4','Khulna','Jhenaidah'],
  [85,'যশোর-১','Jashore-1','Khulna','Jashore'],
  [86,'যশোর-২','Jashore-2','Khulna','Jashore'],
  [87,'যশোর-৩','Jashore-3','Khulna','Jashore'],
  [88,'যশোর-৪','Jashore-4','Khulna','Jashore'],
  [89,'যশোর-৫','Jashore-5','Khulna','Jashore'],
  [90,'যশোর-৬','Jashore-6','Khulna','Jashore'],
  [91,'মাগুরা-১','Magura-1','Khulna','Magura'],
  [92,'মাগুরা-২','Magura-2','Khulna','Magura'],
  [93,'নড়াইল-১','Narail-1','Khulna','Narail'],
  [94,'নড়াইল-২','Narail-2','Khulna','Narail'],
  [95,'বাগেরহাট-১','Bagerhat-1','Khulna','Bagerhat'],
  [96,'বাগেরহাট-২','Bagerhat-2','Khulna','Bagerhat'],
  [97,'বাগেরহাট-৩','Bagerhat-3','Khulna','Bagerhat'],
  [98,'বাগেরহাট-৪','Bagerhat-4','Khulna','Bagerhat'],
  [99,'খুলনা-১','Khulna-1','Khulna','Khulna'],
  [100,'খুলনা-২','Khulna-2','Khulna','Khulna'],
  [101,'খুলনা-৩','Khulna-3','Khulna','Khulna'],
  [102,'খুলনা-৪','Khulna-4','Khulna','Khulna'],
  [103,'খুলনা-৫','Khulna-5','Khulna','Khulna'],
  [104,'খুলনা-৬','Khulna-6','Khulna','Khulna'],
  [105,'সাতক্ষীরা-১','Satkhira-1','Khulna','Satkhira'],
  [106,'সাতক্ষীরা-২','Satkhira-2','Khulna','Satkhira'],
  [107,'সাতক্ষীরা-৩','Satkhira-3','Khulna','Satkhira'],
  [108,'সাতক্ষীরা-৪','Satkhira-4','Khulna','Satkhira'],
  [109,'বরগুনা-১','Barguna-1','Barisal','Barguna'],
  [110,'বরগুনা-২','Barguna-2','Barisal','Barguna'],
  [111,'পটুয়াখালী-১','Patuakhali-1','Barisal','Patuakhali'],
  [112,'পটুয়াখালী-২','Patuakhali-2','Barisal','Patuakhali'],
  [113,'পটুয়াখালী-৩','Patuakhali-3','Barisal','Patuakhali'],
  [114,'পটুয়াখালী-৪','Patuakhali-4','Barisal','Patuakhali'],
  [115,'ভোলা-১','Bhola-1','Barisal','Bhola'],
  [116,'ভোলা-২','Bhola-2','Barisal','Bhola'],
  [117,'ভোলা-৩','Bhola-3','Barisal','Bhola'],
  [118,'ভোলা-৪','Bhola-4','Barisal','Bhola'],
  [119,'বরিশাল-১','Barisal-1','Barisal','Barisal'],
  [120,'বরিশাল-২','Barisal-2','Barisal','Barisal'],
  [121,'বরিশাল-৩','Barisal-3','Barisal','Barisal'],
  [122,'বরিশাল-৪','Barisal-4','Barisal','Barisal'],
  [123,'বরিশাল-৫','Barisal-5','Barisal','Barisal'],
  [124,'বরিশাল-৬','Barisal-6','Barisal','Barisal'],
  [125,'ঝালকাঠি-১','Jhalokati-1','Barisal','Jhalokati'],
  [126,'ঝালকাঠি-২','Jhalokati-2','Barisal','Jhalokati'],
  [127,'পিরোজপুর-১','Pirojpur-1','Barisal','Pirojpur'],
  [128,'পিরোজপুর-২','Pirojpur-2','Barisal','Pirojpur'],
  [129,'পিরোজপুর-৩','Pirojpur-3','Barisal','Pirojpur'],
  [130,'জামালপুর-১','Jamalpur-1','Mymensingh','Jamalpur'],
  [131,'জামালপুর-২','Jamalpur-2','Mymensingh','Jamalpur'],
  [132,'জামালপুর-৩','Jamalpur-3','Mymensingh','Jamalpur'],
  [133,'জামালপুর-৪','Jamalpur-4','Mymensingh','Jamalpur'],
  [134,'জামালপুর-৫','Jamalpur-5','Mymensingh','Jamalpur'],
  [135,'শেরপুর-১','Sherpur-1','Mymensingh','Sherpur'],
  [136,'শেরপুর-২','Sherpur-2','Mymensingh','Sherpur'],
  [137,'শেরপুর-৩','Sherpur-3','Mymensingh','Sherpur'],
  [138,'ময়মনসিংহ-১','Mymensingh-1','Mymensingh','Mymensingh'],
  [139,'ময়মনসিংহ-২','Mymensingh-2','Mymensingh','Mymensingh'],
  [140,'ময়মনসিংহ-৩','Mymensingh-3','Mymensingh','Mymensingh'],
  [141,'ময়মনসিংহ-৪','Mymensingh-4','Mymensingh','Mymensingh'],
  [142,'ময়মনসিংহ-৫','Mymensingh-5','Mymensingh','Mymensingh'],
  [143,'ময়মনসিংহ-৬','Mymensingh-6','Mymensingh','Mymensingh'],
  [144,'ময়মনসিংহ-৭','Mymensingh-7','Mymensingh','Mymensingh'],
  [145,'ময়মনসিংহ-৮','Mymensingh-8','Mymensingh','Mymensingh'],
  [146,'ময়মনসিংহ-৯','Mymensingh-9','Mymensingh','Mymensingh'],
  [147,'ময়মনসিংহ-১০','Mymensingh-10','Mymensingh','Mymensingh'],
  [148,'ময়মনসিংহ-১১','Mymensingh-11','Mymensingh','Mymensingh'],
  [149,'নেত্রকোণা-১','Netrokona-1','Mymensingh','Netrokona'],
  [150,'নেত্রকোণা-২','Netrokona-2','Mymensingh','Netrokona'],
  [151,'নেত্রকোণা-৩','Netrokona-3','Mymensingh','Netrokona'],
  [152,'নেত্রকোণা-৪','Netrokona-4','Mymensingh','Netrokona'],
  [153,'নেত্রকোণা-৫','Netrokona-5','Mymensingh','Netrokona'],
  [154,'টাঙ্গাইল-১','Tangail-1','Dhaka','Tangail'],
  [155,'টাঙ্গাইল-২','Tangail-2','Dhaka','Tangail'],
  [156,'টাঙ্গাইল-৩','Tangail-3','Dhaka','Tangail'],
  [157,'টাঙ্গাইল-৪','Tangail-4','Dhaka','Tangail'],
  [158,'টাঙ্গাইল-৫','Tangail-5','Dhaka','Tangail'],
  [159,'টাঙ্গাইল-৬','Tangail-6','Dhaka','Tangail'],
  [160,'টাঙ্গাইল-৭','Tangail-7','Dhaka','Tangail'],
  [161,'টাঙ্গাইল-৮','Tangail-8','Dhaka','Tangail'],
  [162,'কিশোরগঞ্জ-১','Kishoreganj-1','Dhaka','Kishoreganj'],
  [163,'কিশোরগঞ্জ-২','Kishoreganj-2','Dhaka','Kishoreganj'],
  [164,'কিশোরগঞ্জ-৩','Kishoreganj-3','Dhaka','Kishoreganj'],
  [165,'কিশোরগঞ্জ-৪','Kishoreganj-4','Dhaka','Kishoreganj'],
  [166,'কিশোরগঞ্জ-৫','Kishoreganj-5','Dhaka','Kishoreganj'],
  [167,'কিশোরগঞ্জ-৬','Kishoreganj-6','Dhaka','Kishoreganj'],
  [168,'মানিকগঞ্জ-১','Manikganj-1','Dhaka','Manikganj'],
  [169,'মানিকগঞ্জ-২','Manikganj-2','Dhaka','Manikganj'],
  [170,'মানিকগঞ্জ-৩','Manikganj-3','Dhaka','Manikganj'],
  [171,'মুন্সীগঞ্জ-১','Munshiganj-1','Dhaka','Munshiganj'],
  [172,'মুন্সীগঞ্জ-২','Munshiganj-2','Dhaka','Munshiganj'],
  [173,'মুন্সীগঞ্জ-৩','Munshiganj-3','Dhaka','Munshiganj'],
  [174,'ঢাকা-১','Dhaka-1','Dhaka','Dhaka'],
  [175,'ঢাকা-২','Dhaka-2','Dhaka','Dhaka'],
  [176,'ঢাকা-৩','Dhaka-3','Dhaka','Dhaka'],
  [177,'ঢাকা-৪','Dhaka-4','Dhaka','Dhaka'],
  [178,'ঢাকা-৫','Dhaka-5','Dhaka','Dhaka'],
  [179,'ঢাকা-৬','Dhaka-6','Dhaka','Dhaka'],
  [180,'ঢাকা-৭','Dhaka-7','Dhaka','Dhaka'],
  [181,'ঢাকা-৮','Dhaka-8','Dhaka','Dhaka'],
  [182,'ঢাকা-৯','Dhaka-9','Dhaka','Dhaka'],
  [183,'ঢাকা-১০','Dhaka-10','Dhaka','Dhaka'],
  [184,'ঢাকা-১১','Dhaka-11','Dhaka','Dhaka'],
  [185,'ঢাকা-১২','Dhaka-12','Dhaka','Dhaka'],
  [186,'ঢাকা-১৩','Dhaka-13','Dhaka','Dhaka'],
  [187,'ঢাকা-১৪','Dhaka-14','Dhaka','Dhaka'],
  [188,'ঢাকা-১৫','Dhaka-15','Dhaka','Dhaka'],
  [189,'ঢাকা-১৬','Dhaka-16','Dhaka','Dhaka'],
  [190,'ঢাকা-১৭','Dhaka-17','Dhaka','Dhaka'],
  [191,'ঢাকা-১৮','Dhaka-18','Dhaka','Dhaka'],
  [192,'ঢাকা-১৯','Dhaka-19','Dhaka','Dhaka'],
  [193,'ঢাকা-২০','Dhaka-20','Dhaka','Dhaka'],
  [194,'গাজীপুর-১','Gazipur-1','Dhaka','Gazipur'],
  [195,'গাজীপুর-২','Gazipur-2','Dhaka','Gazipur'],
  [196,'গাজীপুর-৩','Gazipur-3','Dhaka','Gazipur'],
  [197,'গাজীপুর-৪','Gazipur-4','Dhaka','Gazipur'],
  [198,'গাজীপুর-৫','Gazipur-5','Dhaka','Gazipur'],
  [199,'নরসিংদী-১','Narsingdi-1','Dhaka','Narsingdi'],
  [200,'নরসিংদী-২','Narsingdi-2','Dhaka','Narsingdi'],
  [201,'নরসিংদী-৩','Narsingdi-3','Dhaka','Narsingdi'],
  [202,'নরসিংদী-৪','Narsingdi-4','Dhaka','Narsingdi'],
  [203,'নরসিংদী-৫','Narsingdi-5','Dhaka','Narsingdi'],
  [204,'নারায়ণগঞ্জ-১','Narayanganj-1','Dhaka','Narayanganj'],
  [205,'নারায়ণগঞ্জ-২','Narayanganj-2','Dhaka','Narayanganj'],
  [206,'নারায়ণগঞ্জ-৩','Narayanganj-3','Dhaka','Narayanganj'],
  [207,'নারায়ণগঞ্জ-৪','Narayanganj-4','Dhaka','Narayanganj'],
  [208,'নারায়ণগঞ্জ-৫','Narayanganj-5','Dhaka','Narayanganj'],
  [209,'রাজবাড়ী-১','Rajbari-1','Dhaka','Rajbari'],
  [210,'রাজবাড়ী-২','Rajbari-2','Dhaka','Rajbari'],
  [211,'ফরিদপুর-১','Faridpur-1','Dhaka','Faridpur'],
  [212,'ফরিদপুর-২','Faridpur-2','Dhaka','Faridpur'],
  [213,'ফরিদপুর-৩','Faridpur-3','Dhaka','Faridpur'],
  [214,'ফরিদপুর-৪','Faridpur-4','Dhaka','Faridpur'],
  [215,'গোপালগঞ্জ-১','Gopalganj-1','Dhaka','Gopalganj'],
  [216,'গোপালগঞ্জ-২','Gopalganj-2','Dhaka','Gopalganj'],
  [217,'গোপালগঞ্জ-৩','Gopalganj-3','Dhaka','Gopalganj'],
  [218,'মাদারীপুর-১','Madaripur-1','Dhaka','Madaripur'],
  [219,'মাদারীপুর-২','Madaripur-2','Dhaka','Madaripur'],
  [220,'মাদারীপুর-৩','Madaripur-3','Dhaka','Madaripur'],
  [221,'শরীয়তপুর-১','Shariatpur-1','Dhaka','Shariatpur'],
  [222,'শরীয়তপুর-২','Shariatpur-2','Dhaka','Shariatpur'],
  [223,'শরীয়তপুর-৩','Shariatpur-3','Dhaka','Shariatpur'],
  [224,'সুনামগঞ্জ-১','Sunamganj-1','Sylhet','Sunamganj'],
  [225,'সুনামগঞ্জ-২','Sunamganj-2','Sylhet','Sunamganj'],
  [226,'সুনামগঞ্জ-৩','Sunamganj-3','Sylhet','Sunamganj'],
  [227,'সুনামগঞ্জ-৪','Sunamganj-4','Sylhet','Sunamganj'],
  [228,'সুনামগঞ্জ-৫','Sunamganj-5','Sylhet','Sunamganj'],
  [229,'সিলেট-১','Sylhet-1','Sylhet','Sylhet'],
  [230,'সিলেট-২','Sylhet-2','Sylhet','Sylhet'],
  [231,'সিলেট-৩','Sylhet-3','Sylhet','Sylhet'],
  [232,'সিলেট-৪','Sylhet-4','Sylhet','Sylhet'],
  [233,'সিলেট-৫','Sylhet-5','Sylhet','Sylhet'],
  [234,'সিলেট-৬','Sylhet-6','Sylhet','Sylhet'],
  [235,'মৌলভীবাজার-১','Moulvibazar-1','Sylhet','Moulvibazar'],
  [236,'মৌলভীবাজার-২','Moulvibazar-2','Sylhet','Moulvibazar'],
  [237,'মৌলভীবাজার-৩','Moulvibazar-3','Sylhet','Moulvibazar'],
  [238,'মৌলভীবাজার-৪','Moulvibazar-4','Sylhet','Moulvibazar'],
  [239,'হবিগঞ্জ-১','Habiganj-1','Sylhet','Habiganj'],
  [240,'হবিগঞ্জ-২','Habiganj-2','Sylhet','Habiganj'],
  [241,'হবিগঞ্জ-৩','Habiganj-3','Sylhet','Habiganj'],
  [242,'হবিগঞ্জ-৪','Habiganj-4','Sylhet','Habiganj'],
  [243,'ব্রাহ্মণবাড়িয়া-১','Brahmanbaria-1','Chittagong','Brahmanbaria'],
  [244,'ব্রাহ্মণবাড়িয়া-২','Brahmanbaria-2','Chittagong','Brahmanbaria'],
  [245,'ব্রাহ্মণবাড়িয়া-৩','Brahmanbaria-3','Chittagong','Brahmanbaria'],
  [246,'ব্রাহ্মণবাড়িয়া-৪','Brahmanbaria-4','Chittagong','Brahmanbaria'],
  [247,'ব্রাহ্মণবাড়িয়া-৫','Brahmanbaria-5','Chittagong','Brahmanbaria'],
  [248,'ব্রাহ্মণবাড়িয়া-৬','Brahmanbaria-6','Chittagong','Brahmanbaria'],
  [249,'কুমিল্লা-১','Cumilla-1','Chittagong','Cumilla'],
  [250,'কুমিল্লা-২','Cumilla-2','Chittagong','Cumilla'],
  [251,'কুমিল্লা-৩','Cumilla-3','Chittagong','Cumilla'],
  [252,'কুমিল্লা-৪','Cumilla-4','Chittagong','Cumilla'],
  [253,'কুমিল্লা-৫','Cumilla-5','Chittagong','Cumilla'],
  [254,'কুমিল্লা-৬','Cumilla-6','Chittagong','Cumilla'],
  [255,'কুমিল্লা-৭','Cumilla-7','Chittagong','Cumilla'],
  [256,'কুমিল্লা-৮','Cumilla-8','Chittagong','Cumilla'],
  [257,'কুমিল্লা-৯','Cumilla-9','Chittagong','Cumilla'],
  [258,'কুমিল্লা-১০','Cumilla-10','Chittagong','Cumilla'],
  [259,'কুমিল্লা-১১','Cumilla-11','Chittagong','Cumilla'],
  [260,'চাঁদপুর-১','Chandpur-1','Chittagong','Chandpur'],
  [261,'চাঁদপুর-২','Chandpur-2','Chittagong','Chandpur'],
  [262,'চাঁদপুর-৩','Chandpur-3','Chittagong','Chandpur'],
  [263,'চাঁদপুর-৪','Chandpur-4','Chittagong','Chandpur'],
  [264,'চাঁদপুর-৫','Chandpur-5','Chittagong','Chandpur'],
  [265,'ফেনী-১','Feni-1','Chittagong','Feni'],
  [266,'ফেনী-২','Feni-2','Chittagong','Feni'],
  [267,'ফেনী-৩','Feni-3','Chittagong','Feni'],
  [268,'নোয়াখালী-১','Noakhali-1','Chittagong','Noakhali'],
  [269,'নোয়াখালী-২','Noakhali-2','Chittagong','Noakhali'],
  [270,'নোয়াখালী-৩','Noakhali-3','Chittagong','Noakhali'],
  [271,'নোয়াখালী-৪','Noakhali-4','Chittagong','Noakhali'],
  [272,'নোয়াখালী-৫','Noakhali-5','Chittagong','Noakhali'],
  [273,'নোয়াখালী-৬','Noakhali-6','Chittagong','Noakhali'],
  [274,'লক্ষ্মীপুর-১','Lakshmipur-1','Chittagong','Lakshmipur'],
  [275,'লক্ষ্মীপুর-২','Lakshmipur-2','Chittagong','Lakshmipur'],
  [276,'লক্ষ্মীপুর-৩','Lakshmipur-3','Chittagong','Lakshmipur'],
  [277,'লক্ষ্মীপুর-৪','Lakshmipur-4','Chittagong','Lakshmipur'],
  [278,'চট্টগ্রাম-১','Chattogram-1','Chittagong','Chattogram'],
  [279,'চট্টগ্রাম-২','Chattogram-2','Chittagong','Chattogram'],
  [280,'চট্টগ্রাম-৩','Chattogram-3','Chittagong','Chattogram'],
  [281,'চট্টগ্রাম-৪','Chattogram-4','Chittagong','Chattogram'],
  [282,'চট্টগ্রাম-৫','Chattogram-5','Chittagong','Chattogram'],
  [283,'চট্টগ্রাম-৬','Chattogram-6','Chittagong','Chattogram'],
  [284,'চট্টগ্রাম-৭','Chattogram-7','Chittagong','Chattogram'],
  [285,'চট্টগ্রাম-৮','Chattogram-8','Chittagong','Chattogram'],
  [286,'চট্টগ্রাম-৯','Chattogram-9','Chittagong','Chattogram'],
  [287,'চট্টগ্রাম-১০','Chattogram-10','Chittagong','Chattogram'],
  [288,'চট্টগ্রাম-১১','Chattogram-11','Chittagong','Chattogram'],
  [289,'চট্টগ্রাম-১২','Chattogram-12','Chittagong','Chattogram'],
  [290,'চট্টগ্রাম-১৩','Chattogram-13','Chittagong','Chattogram'],
  [291,'চট্টগ্রাম-১৪','Chattogram-14','Chittagong','Chattogram'],
  [292,'চট্টগ্রাম-১৫','Chattogram-15','Chittagong','Chattogram'],
  [293,'চট্টগ্রাম-১৬','Chattogram-16','Chittagong','Chattogram'],
  [294,'কক্সবাজার-১','Coxsbazar-1','Chittagong','Coxsbazar'],
  [295,'কক্সবাজার-২','Coxsbazar-2','Chittagong','Coxsbazar'],
  [296,'কক্সবাজার-৩','Coxsbazar-3','Chittagong','Coxsbazar'],
  [297,'কক্সবাজার-৪','Coxsbazar-4','Chittagong','Coxsbazar'],
  [298,'পার্বত্য খাগড়াছড়ি','Parvatya Khagrachhari','Chittagong','Khagrachhari'],
  [299,'পার্বত্য রাঙ্গামাটি','Parvatya Rangamati','Chittagong','Rangamati'],
  [300,'পার্বত্য বান্দরবান','Parvatya Bandarban','Chittagong','Bandarban'],
];

// 10 real MPs: [number, name, email, party, constituencyNumber]
const REAL_MPs = [
  { num: 1, name: 'Barrister Muhammad Nawshad Zamir', email: 'mp.nawshad@party.gov', party: 'Bangladesh Nationalist Party', cNum: 1 },
  { num: 2, name: 'Forhad Hossain Azad', email: 'mp.forhad@party.gov', party: 'Bangladesh Nationalist Party', cNum: 2 },
  { num: 3, name: 'Mirza Fakhrul Islam Alamgir', email: 'mp.fakhrul@party.gov', party: 'Bangladesh Nationalist Party', cNum: 3 },
  { num: 4, name: 'Md. Abdus Salam', email: 'mp.salam@party.gov', party: 'Bangladesh Nationalist Party', cNum: 4 },
  { num: 5, name: 'Md Jahidur Rahaman', email: 'mp.jahidur@party.gov', party: 'Bangladesh Nationalist Party', cNum: 5 },
  { num: 6, name: 'Md Monjurul Islam', email: 'mp.monjurul@party.gov', party: 'Bangladesh Nationalist Party', cNum: 6 },
  { num: 7, name: 'Md Sadique Reaz', email: 'mp.sadique@party.gov', party: 'Bangladesh Nationalist Party', cNum: 7 },
  { num: 8, name: 'Syed Jahangir Alam', email: 'mp.jahangir@party.gov', party: 'Bangladesh Nationalist Party', cNum: 8 },
  { num: 9, name: 'Md Akhtaruzzaman Mia', email: 'mp.akhtar@party.gov', party: 'Bangladesh Nationalist Party', cNum: 9 },
  { num: 10, name: 'A.Z.M. Rezwanul Haque', email: 'mp.rezwanul@party.gov', party: 'Independent', cNum: 10 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Core admin users
  const admin = await prisma.user.upsert({ where:{email:'admin@party.gov'}, update:{}, create:{email:'admin@party.gov',name:'System Administrator',passwordHash:await h('Admin@123'),role:Role.ADMIN} });
  await prisma.user.upsert({ where:{email:'chairman@party.gov'}, update:{}, create:{email:'chairman@party.gov',name:'Party Chairman',passwordHash:await h('Chairman@123'),role:Role.CHAIRMAN} });
  const minister = await prisma.user.upsert({ where:{email:'minister@party.gov'}, update:{}, create:{email:'minister@party.gov',name:'Senior Minister',passwordHash:await h('Minister@123'),role:Role.MINISTER} });
  const pub = await prisma.user.upsert({ where:{email:'public@example.com'}, update:{}, create:{email:'public@example.com',name:'Demo Public User',passwordHash:await h('Public@123'),role:Role.PUBLIC} });

  // Party admins
  const bnpAdmin = await prisma.user.upsert({ where:{email:'admin.bnp@party.gov'}, update:{}, create:{email:'admin.bnp@party.gov',name:'BNP Party Admin',passwordHash:await h('BNP@admin123'),role:Role.PARTY_ADMIN,partyName:'Bangladesh Nationalist Party'} });
  await prisma.user.upsert({ where:{email:'admin.jbi@party.gov'}, update:{}, create:{email:'admin.jbi@party.gov',name:'Jamaat-e-Islami Admin',passwordHash:await h('JBI@admin123'),role:Role.PARTY_ADMIN,partyName:'Bangladesh Jamaat-e-Islami'} });
  await prisma.user.upsert({ where:{email:'admin.ncp@party.gov'}, update:{}, create:{email:'admin.ncp@party.gov',name:'NCP Party Admin',passwordHash:await h('NCP@admin123'),role:Role.PARTY_ADMIN,partyName:'National Citizen Party'} });
  await prisma.user.upsert({ where:{email:'admin.bjp@party.gov'}, update:{}, create:{email:'admin.bjp@party.gov',name:'BJP Party Admin',passwordHash:await h('BJP@admin123'),role:Role.PARTY_ADMIN,partyName:'Bangladesh Jatiya Party'} });
  console.log('✓ Admin users');

  // Seed 300 constituencies (replace old auto-generated ones)
  const existingCount = await prisma.constituency.count();
  if (existingCount > 0) {
    // Clear mpId first to avoid FK issues, then delete
    await prisma.constituency.updateMany({ data: { mpId: null } });
    await prisma.constituency.deleteMany({});
  }
  await prisma.constituency.createMany({
    data: CONSTITUENCIES.map(([number, nameBn, nameEn, province, region]) => ({
      number,
      name: nameEn,
      nameBn,
      region,
      province,
      constituencyKey: nameEn.toLowerCase().replace(/\s+/g, '-'),
    })),
  });
  console.log('✓ 300 real constituencies');

  // Seed MP users and link to constituencies
  for (const mp of REAL_MPs) {
    const mpUser = await prisma.user.upsert({
      where: { email: mp.email },
      update: { partyName: mp.party },
      create: { email: mp.email, name: mp.name, passwordHash: await h('MP@123456'), role: Role.MP, partyName: mp.party },
    });
    await prisma.constituency.update({
      where: { number: mp.cNum },
      data: { mpId: mpUser.id },
    });
  }
  console.log('✓ 10 real MPs seeded and linked');

  // Seed parties
  const partiesData = [
    { name:'Bangladesh Nationalist Party', leader:'Tarique Rahman', ideology:'Liberalism\nConservatism\nEconomic liberalism', parliamentaryPosition:'Government' },
    { name:'Bangladesh Jamaat-e-Islami', leader:'Shafiqur Rahman', ideology:'Islamism\nConservatism\nNeo-Islamism\nReformism', parliamentaryPosition:'Opposition' },
    { name:'National Citizen Party', leader:'Nahid Islam', ideology:'Reformism', parliamentaryPosition:'Opposition' },
    { name:'Bangladesh Jatiya Party', leader:'Andaleeve Rahman', ideology:'Liberalism\nConservatism\nEconomic liberalism', parliamentaryPosition:'Confidence and supply' },
    { name:'Bangladesh Khelafat Majlis', leader:'Mamunul Haque', ideology:'Islamism\nConservatism', parliamentaryPosition:'Opposition' },
    { name:'Khelafat Majlis', leader:'Abdul Basit Azad', ideology:'Islamism', parliamentaryPosition:'Opposition' },
    { name:'Bangladesh Khilafat Andolan', leader:'Habibullah Mianji', ideology:'Islamism', parliamentaryPosition:'Opposition' },
    { name:'Nizam-e-Islam Party', leader:'Sarwar Kamal Azizi', ideology:'Islamism\nConservatism', parliamentaryPosition:'Opposition' },
    { name:'Bangladesh Development Party', leader:'Anwarul Islam Chan', ideology:'Developmentalism', parliamentaryPosition:'Opposition' },
    { name:'Jatiya Ganotantrik Party', leader:'Tasmia Pradhan', ideology:'Democracy\nNationalism', parliamentaryPosition:'Opposition' },
    { name:'Liberal Democratic Party', leader:'Oli Ahmad', ideology:'Liberalism\nDemocracy', parliamentaryPosition:'Opposition' },
    { name:'Amar Bangladesh Party', leader:'Mojibur Rahman Bhuiyan Monju', ideology:'Nationalism', parliamentaryPosition:'Opposition' },
    { name:'Bangladesh Labour Party', leader:'Mustafizur Rahman Iran', ideology:'Labour rights\nSocialism', parliamentaryPosition:'Opposition' },
  ];

  await prisma.party.deleteMany({});
  const createdParties: Record<string, string> = {};
  for (const p of partiesData) {
    const party = await prisma.party.create({ data: p });
    createdParties[p.name] = party.id;
  }
  console.log('✓ Parties seeded');

  // Seed alliances
  await prisma.alliance.deleteMany({});
  const bnpPlus = await prisma.alliance.create({ data: { name: 'BNP+', founded: '2023' } });
  const elevenParties = await prisma.alliance.create({ data: { name: '11 Parties', founded: '19 October 2025 (as Like-minded 8 Parties)\nJanuary 2026 (as 11 Party Alliance)' } });

  const bnpPlusMembers = ['Bangladesh Nationalist Party', 'Bangladesh Jatiya Party'];
  const elevenPartyMembers = ['Bangladesh Jamaat-e-Islami','National Citizen Party','Bangladesh Khelafat Majlis','Khelafat Majlis','Bangladesh Khilafat Andolan','Nizam-e-Islam Party','Bangladesh Development Party','Jatiya Ganotantrik Party','Liberal Democratic Party','Amar Bangladesh Party','Bangladesh Labour Party'];

  for (const name of bnpPlusMembers) {
    if (createdParties[name]) await prisma.allianceParty.create({ data: { partyId: createdParties[name], allianceId: bnpPlus.id } });
  }
  for (const name of elevenPartyMembers) {
    if (createdParties[name]) await prisma.allianceParty.create({ data: { partyId: createdParties[name], allianceId: elevenParties.id } });
  }
  console.log('✓ Alliances seeded');

  // Base seed data
  const proposal = await prisma.proposal.upsert({ where:{id:'seed-p1'}, update:{}, create:{id:'seed-p1',title:'National Infrastructure Development Bill',description:'Allocate funds for rural road construction and electrification across all 300 constituencies.',status:'OPEN',createdById:admin.id} });
  await prisma.vote.upsert({ where:{proposalId_ministerId:{proposalId:proposal.id,ministerId:minister.id}}, update:{}, create:{choice:'YES',proposalId:proposal.id,ministerId:minister.id} });
  await prisma.news.upsert({ where:{id:'seed-n1'}, update:{}, create:{id:'seed-n1',title:'Party Wins Regional Election with Landslide Victory',content:'Our party secured a decisive victory winning 85% of contested seats.',publishedById:admin.id} });
  await prisma.event.upsert({ where:{id:'seed-e1'}, update:{}, create:{id:'seed-e1',title:'Annual Party Convention 2024',description:'Annual gathering of all party members.',location:'National Assembly Hall, Dhaka',startDate:new Date('2024-12-15T09:00:00Z'),endDate:new Date('2024-12-15T18:00:00Z'),createdById:admin.id} });
  await prisma.fund.createMany({ skipDuplicates:true, data:[
    {type:'DONATION',amount:500000,description:'Corporate sponsorship Q4',category:'Corporate',recordedById:admin.id,partyName:'Bangladesh Nationalist Party'},
    {type:'DONATION',amount:150000,description:'Member contributions',category:'Member Dues',recordedById:admin.id,partyName:'Bangladesh Nationalist Party'},
    {type:'EXPENSE',amount:75000,description:'Campaign materials',category:'Campaign',recordedById:admin.id,partyName:'Bangladesh Nationalist Party'},
    {type:'EXPENSE',amount:25000,description:'Office supplies',category:'Operations',recordedById:admin.id,partyName:'Bangladesh Nationalist Party'},
    {type:'DONATION',amount:300000,description:'Party donation',category:'General',recordedById:bnpAdmin.id,partyName:'Bangladesh Jamaat-e-Islami'},
    {type:'EXPENSE',amount:100000,description:'Election campaign',category:'Campaign',recordedById:bnpAdmin.id,partyName:'Bangladesh Jamaat-e-Islami'},
  ]});
  await prisma.complaint.upsert({ where:{id:'seed-c1'}, update:{}, create:{id:'seed-c1',subject:'Delayed Constituency Funds',description:'Development funds not disbursed for 3 months.',status:'PENDING',submittedById:pub.id} });
  await prisma.rumor.upsert({ where:{id:'seed-r1'}, update:{}, create:{id:'seed-r1',title:'Rumor about party merger',description:'Unverified claims about a party merger.',status:'UNDER_REVIEW',reportedById:pub.id} });

  console.log('\n🎉 Seeded!\nAdmin: admin@party.gov / Admin@123\nBNP Admin: admin.bnp@party.gov / BNP@admin123\nMP1 (Panchagarh-1): mp.nawshad@party.gov / MP@123456\nMP3 (Thakurgaon-1): mp.fakhrul@party.gov / MP@123456\nPublic: public@example.com / Public@123');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
