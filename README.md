# BioCosmetic

Un mini-proiect frontend (HTML, CSS, JavaScript) pentru un magazin de cosmetice bio. Aplică un flux complet de listare produse, paginare, detalii produs cu selector de cantitate, coș de cumpărături bazat pe localStorage și o pagină de administrare simplificată. Interfața este localizată în limba română (ex. „Coș”) și include un mic logo tip frunză în navbar.

## Prezentare pe scurt

- Listare produse cu paginare client-side (8 produse/pagină) și layout responsiv (maxim 4 pe rând pe ecrane mari, 3 pe tabletă, 2 pe mobile mici).
- Detalii produs: titlu, preț și descriere centrate; selector de cantitate; buton „Adaugă în Coș”.
- Notificare tip toast la adăugare în coș (include imaginea, denumirea și cantitatea adăugată).
- Coș de cumpărături: incrementare/decrementare cantitate, eliminare produs, total dinamic și badge cu numărul articolelor în navbar.
- Admin: acțiuni de bază pentru produse (cu texte localizate: „Adaugă produs” / „Salvează”).
- Navigare uniformizată pe toate paginile cu icon frunză și text „BioCosmetic”.

## Tehnologii

- HTML5, CSS3, JavaScript (vanilla)
- Font Awesome pentru iconițe (frunză în navbar)
- localStorage pentru persistența coșului în browser
- Fetch API pentru date produse (MockAPI)

Endpoint produse (MockAPI):

- https://69030bc3d0f10a340b225a62.mockapi.io/products

Structura minimă a unui produs (așteptată în aplicație):

- id (string)
- name (string)
- image (URL string)
- description (string)
- price (number)

## Structură proiect (relevante)

- `index.html` – Listare produse + paginare, navbar cu badge „Coș”
- `details.html` – Pagină de detalii produs, selector de cantitate, toast
- `cart.html` – Coșul de cumpărături (tabel, total, acțiuni)
- `admin.html` – Admin simplu pentru produse
- `app.js` – Fetch produse, randare carduri și paginare, adăugare în coș
- `details.js` – Randare detalii, selector cantitate, toast, adăugare în coș
- `cart.js` – Randare coș, total, plus/minus cantitate, ștergere, badge navbar
- `style.css` – Navbar, grilă responsivă, carduri, paginare, detalii, toast, coș

## Cum rulezi local

1. Deschide folderul proiectului în VS Code (recomandat).
2. Servește local (ex. extensia „Live Server”) sau deschide direct `index.html` în browser.
3. Verifică în consola browserului eventuale erori de rețea către MockAPI (CORS sau offline).

Notă: Coșul se stochează în `localStorage` sub cheia `cart` ca obiect indexat după `productId`:

```
cart = {
	"1": { id: "1", name: "...", price: 99.9, image: "...", quantity: 2 },
	"7": { id: "7", name: "...", price: 49.9, image: "...", quantity: 1 }
}
```

## Detalii de implementare

- Paginare

  - Se face client-side, pe baza array-ului de produse încărcat o singură dată.
  - 8 produse/pagină, cu butoane „Înapoi/Înainte” și indicator curent/total.

- Layout responsiv listă produse

  - Maxim 4 pe rând pe ecrane mari (centrat), 3 pe tabletă, 2 pe mobile mici.

- Carduri produse

  - Titlul produsului are font de 20px, bold; butoanele „Detalii” și „Adaugă în Coș” au înălțimi egale.

- Pagina de detalii

  - Titlul, prețul și descrierea sunt centrate.
  - Selector de cantitate cu butoane +/- și eticheta „CANTITATE”.
  - La adăugare în coș, se afișează un toast (dreapta sus) cu imaginea și mesajul de confirmare.

- Coș (cart)
  - Badge-ul cu numărul articolelor se actualizează pe toate paginile.
  - În `cart.html` există plus/minus pentru cantitate, ștergere produs și total dinamic.
  - Codul a fost curățat, păstrând doar funcțiile necesare: încărcare coș, calcul total, acțiuni (plus/minus/ștergere) și sincronizare badge.

## Fluxuri principale

1. Adăugare în coș din listă sau detalii

   - Se citește cantitatea (implicit 1 sau cea din selector), se actualizează obiectul `cart` din `localStorage`, se actualizează badge-ul și (în detalii) se afișează toast.

2. Paginare listă produse

   - Produsele sunt încărcate o singură dată, iar randarea pe pagină se face prin `slice` din array-ul memorat.

3. Management coș
   - În `cart.html`, acțiunile plus/minus actualizează cantitatea în `localStorage`, recalculează totalul și re-randează tabelul. Eliminarea scoate produsul din coș.

## Limitări și posibile îmbunătățiri

- Persistența coșului este doar în browser (localStorage); nu există conturi/utilizatori.
- Paginarea este doar client-side; pentru seturi foarte mari de date ar fi utilă paginarea server-side.
- Nu există încă filtrare/căutare produse sau sortare avansată.
- Nu există validări complexe pentru admin; ar putea fi adăugate (ex. required, tipuri, range-uri).
- URL-urile nu memorează pagina curentă (ex. `?page=2`); se poate adăuga.

## Probleme frecvente și soluții

- Nu se încarcă produsele: verifică dacă endpoint-ul MockAPI răspunde și nu e blocat de CORS/firewall.
- Badge-ul „Coș” nu se actualizează: verifică în `localStorage` cheia `cart` și eventual curăță stocarea.
- Imaginile nu se văd: asigură-te că adresele sunt valide (HTTPS) și accesibile.

## Contribuții

PR-urile cu mici îmbunătățiri (doc, UI, accesibilitate, bugfix) sunt binevenite. Pentru modificări mari, deschide mai întâi un issue cu propunerea.

---

Creat cu grijă pentru un UI curat, responsiv și prietenos. 🪴
