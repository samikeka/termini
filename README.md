# termini

Termin Futbolli
09.04.20XX
─
Sami Keka
Kin and Carta 
Prishtine
Kosove
Qëllimi i Projektit:
Ky projekt synon të krijojë një aplikacion për menaxhimin dhe caktimin e termineve për fushat e futbollit. Përdoruesit do të kenë mundësinë të rezervojnë orare të lira për të luajtur futboll në fusha të ndryshme, ndërsa menaxherët e fushave do të mund të menaxhojnë oraret, të menaxhojnë rezervimet dhe të njoftojnë përdoruesit përmes email-eve dhe mesazheve.
Funksionalitetet:
Shikimi i Orareve të Lira:
Përdoruesit do të kenë mundësinë të shikojnë oraret e lira për rezervimin e fushave të futbollit në kohë reale. Kjo do të ndihmojë ata të gjejnë dhe rezervojnë oraret që u përshtaten më së miri.
Menaxhimi i Orareve nga Menaxherët e Fushave:
Menaxherët e fushave do të kenë mundësinë të shohin dhe menaxhojnë oraret e lira dhe të zëna. Ata gjithashtu mund të miratojnë ose refuzojnë rezervime dhe të menaxhojnë informacionin e përdoruesve që kanë bërë rezervime.
Njoftimet për Rezervimet:
Menaxherët e fushave do të njoftohen përmes email-eve dhe mesazheve në telefon kur një rezervim bëhet ose kur ka ndryshime në oraret.
Pagesat Online:
Implementimi i një sistemi të pagesave online për të lehtësuar pagesat për rezervimet e fushave. Ky funksionalitet do të mundësojë që përdoruesit të paguajnë në mënyrë të sigurt dhe të thjeshtë përmes platformës.

Arkitektura e Sistemit
Backend:
Spring Boot: Do të përdoret për zhvillimin e backend-it, duke menaxhuar logjikën e biznesit, lidhjen me bazën e të dhënave dhe ofrimin e API-ve REST për aplikacionin.
Spring Security: Do të përdoret për të menaxhuar sigurinë dhe autentikimin e përdoruesve dhe menaxherëve të fushave.
Frontend:
Thymeleaf (për aplikacionet e brendshme): Për krijimin e faqeve të internetit dhe formave që përdoruesit dhe menaxherët e fushave do të përdorin për të ndërvepruar me sistemin.
React (për një ndërfaqe më dinamike dhe moderne): Përdorimi i React për të krijuar një ndërfaqe të përdoruesit që ofron një përvojë më të pasur dhe më interaktive, veçanërisht nëse planifikoni të ofroni një ndërfaqe të avancuar dhe reagim të shpejtë ndaj veprimeve të përdoruesit.
Baza e të Dhënave:
Spring Data JPA: Për menaxhimin e të dhënave dhe integrimin me bazën e të dhënave, duke përdorur teknologjinë JPA për të ruajtur dhe marrë të dhënat për fushat, rezervimet dhe përdoruesit.
Deploy:
Heroku: Do të përdoret për të bërë deploy të aplikacionit tuaj, duke siguruar që aplikacioni të jetë në dispozicion për përdoruesit në internet dhe të jetë i lehtë për të menaxhuar dhe përditësuar.
Automatizimi:
GitHub Actions: Përdoret për të automatizuar ndërtimin dhe shpërndarjen e aplikacionit në Heroku, duke siguruar që çdo ndryshim në kod të ndihmohet në përditësimin e aplikacionit në mënyrë të automatizuar.

Fazat:
Nexhtësitë dhe Ndarja e Pjesëve të Projektit
Krijimi i Modelit të të Dhënave:
Definoni modelet për Fushat, Oraret, Rezervimet, dhe Përdoruesit në bazën e të dhënave. Krijoni lidhjet e nevojshme dhe vendosni rregullat e biznesit për rezervimet dhe menaxhimin e orareve.
Implementimi i Logjikës së Biznesit:
Zhvilloni logjikën për menaxhimin e rezervimeve, verifikimin e orareve, dhe procesin e pagesave. Implementoni mekanizmat e sigurisë për të mbrojtur të dhënat dhe për të siguruar që përdoruesit kanë qasje të duhur.
Krijimi i Ndërfaqes së Përdoruesit:
Përdorni Thymeleaf ose React për të krijuar ndërfaqen që përdoruesit dhe menaxherët e fushave do të përdorin për të shikuar, rezervuar dhe menaxhuar oraret.
Testimi dhe Sigurimi i Cilësisë:
Kryeni testime unitare dhe integruese për të siguruar që të gjitha funksionalitetet janë të sakta dhe që aplikacioni funksionon siç është e pritur.
Deploy dhe Monitorimi:
Përdorni Heroku për të bërë deploy të aplikacionit dhe konfiguroni monitoringun për të ndjekur performancën dhe për të menaxhuar çdo problem që mund të ndodhi.
Përfitimet e Projektit:
Efikasitet: Automatizimi i procesit të caktimit të termineve dhe menaxhimit të orareve për fushat e futbollit do të ndihmojë në përmirësimin e efikasitetit dhe uljen e përpjekjeve manuale.
Përvoja e Përdoruesit: Ofrimi i një ndërfaqe të thjeshtë dhe të lehtë për t'u përdorur për rezervimin e orareve dhe menaxhimin e rezervimeve do të përmirësojë përvojën e përdoruesve dhe do të rrisë angazhimin.
Menaxhimi i Rëndë: Menaxherët e fushave do të kenë mundësinë të menaxhojnë oraret dhe të trajtojnë rezervimet në mënyrë më të lehtë dhe më të efektshme.


Arkitektura e Sistemit


