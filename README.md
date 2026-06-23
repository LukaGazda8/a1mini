# Bambu Lab A1 mini – Printer Monitor

Webova stranka na sledovanie stavu, udrzby a servisneho dennika 3D tlaciarny **Bambu Lab A1 mini**.

## Funkcie

- **Stav tlaciarny** – manualne sledovanie teploty trysky/podlozky, priebehu tlace, rychlosti, filamentu, celkovych hodin a poctu tlaci
- **Servisny a opravarsky zaznam** – log udrzby s datumom, typom (udrzba/oprava/vylepsenie/poznamka) a popisom
- **Pripomienky udrzby** – podla oficialnych odporucani Bambu Lab (mazanie Y-osi, cistenie hotendu, kontrola remienkov atd.)
- **Technicke udaje** – kompletne specifikacie A1 mini zo zdroja wiki.bambulab.com

## Subory

```
index.html      Hlavna stranka s monitoringom
css/styles.css  Vsetky styly (dark theme)
js/app.js       Logika (localStorage pre stav, log, pripomienky)
```

## Zdroj informacii

Vsetky technicke udaje a odporucania na udrzbu pochadaju z oficialnej wiki:
- https://wiki.bambulab.com/en/a1-mini
- https://wiki.bambulab.com/en/a1-mini/maintenance/period-maintenance
- https://wiki.bambulab.com/en/a1-mini/maintenance/lubricate-y-axis
- https://wiki.bambulab.com/en/a1-mini/maintenance/clean-hotend-assembly

## Lokalne spustenie

```bash
python3 -m http.server 8000
# otvor http://localhost:8000
```

## Nasadenie

Web je nasadeny cez GitHub Pages na:
https://lukagazda8.github.io/a1mini
