# Water Tracker Hydration - Mapa Drogowa Rozwoju

**Wersja aktualna:** 1.3.5
**Data aktualizacji:** 2026-01-04
**Stack technologiczny:** React Native (Expo 53), TypeScript, Zustand, NativeWind, i18next

---

## Podsumowanie Obecnego Stanu

### Zaimplementowane Funkcje
- Logowanie dziennego spozywania wody z konfigurowalnymi rozmiarami szklanki (50-475ml)
- Ustawianie celulu dziennego (domyslnie 2000ml)
- Pelny widok historii z filtrowaniem po datach
- Statystyki tygodniowe/miesieczne z wykresami (react-native-gifted-charts)
- System 11 osiagniec z powiadomieniami in-app
- Sledzenie serii (streak)
- Automatyczne codzienne kopie zapasowe (rotacja 7-dniowa)
- Eksport/import JSON i CSV
- Wsparcie dwujezyczne (EN/PL)
- Konfigurowalne godziny dnia
- Flow onboardingowy
- Ochrona Error Boundary
- Reklamy Google Mobile Ads (banery)

### Znane Problemy
- Blad TypeScript w konfiguracji kolorow tab bar (workaround @ts-ignore w `app/(tabs)/_layout.tsx`)
- Brak haptic feedback przy interakcjach
- Brak stanow ladowania (loading indicators)
- Brak pliku stalych (constants)
- Komunikaty bledow nie sa zlokalizowane

### Zainstalowane ale Niewykorzystane
- expo-haptics (zainstalowane, gotowe do uzycia)
- expo-web-browser (plugin dodany)

---

## v1.4.0 - "Quick Wins & Polish"
**Planowany termin:** Q1 2026
**Temat:** Poprawki UX, naprawienie znanych bledow, drobne usprawnienia

### Krytyczne Poprawki

#### Issue #1: Naprawienie bledu TypeScript w tab bar
**Priorytet:** Wysoki
**Zlozonosc:** Mala (1 dzien)
**Etykiety:** `bug`, `typescript`, `technical-debt`

**Opis:**
Usunac workaround `@ts-ignore` w `app/(tabs)/_layout.tsx` poprzez prawidlowe typowanie dostepu do kolorow z konfiguracji Tailwind.

**Kroki implementacji:**
1. Utworzyc plik `constants/colors.ts` eksportujacy kolory z tailwind.config.js z prawidlowymi typami
2. Zaimportowac kolory bezposrednio zamiast uzywac dynamicznego dostepu do obiektu theme
3. Usunac komentarz @ts-ignore

**Pliki do modyfikacji:**
- `/Users/michalstaniecko/Projects/water-tracker-hydration/app/(tabs)/_layout.tsx`
- Nowy: `/Users/michalstaniecko/Projects/water-tracker-hydration/constants/colors.ts`

---

#### Issue #2: Dodanie haptic feedback
**Priorytet:** Wysoki
**Zlozonosc:** Mala (1 dzien)
**Etykiety:** `enhancement`, `ux`, `quick-win`

**Opis:**
Dodac sprzezenie zwrotne dotykowe (haptic feedback) przy kluczowych interakcjach: dodawanie/usuwanie wody, odblokowanie osiagniecia, przyciski.

**Kroki implementacji:**
1. Utworzyc hook `useHaptics` w `hooks/useHaptics.ts`
2. Dodac haptic feedback w:
   - `components/AddWater.tsx` - przy dodawaniu wody (impactMedium)
   - `components/RemoveWater.tsx` - przy usuwaniu wody (impactLight)
   - `stores/gamification.ts` - przy odblokowaniu osiagniecia (notificationSuccess)
   - `components/ui/Button.tsx` - opcjonalny props dla haptic

**Pliki do modyfikacji:**
- Nowy: `/Users/michalstaniecko/Projects/water-tracker-hydration/hooks/useHaptics.ts`
- `/Users/michalstaniecko/Projects/water-tracker-hydration/components/AddWater.tsx`
- `/Users/michalstaniecko/Projects/water-tracker-hydration/components/RemoveWater.tsx`
- `/Users/michalstaniecko/Projects/water-tracker-hydration/stores/gamification.ts`

---

### Usprawnienia UX

#### Issue #3: Wskazniki ladowania (Loading States)
**Priorytet:** Sredni
**Zlozonosc:** Mala (1-2 dni)
**Etykiety:** `enhancement`, `ux`

**Opis:**
Dodac wizualne wskazniki ladowania podczas operacji asynchronicznych (import/eksport danych, przywracanie kopii zapasowych).

**Kroki implementacji:**
1. Utworzyc komponent `LoadingOverlay` w `components/ui/LoadingOverlay.tsx`
2. Wykorzystac istniejace `isLoading` z `backup.ts` store
3. Dodac skeleton loading dla ekranu statystyk
4. Dodac animacje przy pierwszym ladowaniu danych

**Pliki do modyfikacji:**
- Nowy: `/Users/michalstaniecko/Projects/water-tracker-hydration/components/ui/LoadingOverlay.tsx`
- `/Users/michalstaniecko/Projects/water-tracker-hydration/components/BackupSection.tsx`
- `/Users/michalstaniecko/Projects/water-tracker-hydration/app/(tabs)/statistics.tsx`

---

#### Issue #4: Lokalizacja komunikatow bledow
**Priorytet:** Sredni
**Zlozonosc:** Mala (1 dzien)
**Etykiety:** `enhancement`, `i18n`

**Opis:**
Zlokalizowac wszystkie komunikaty bledow wyswietlane uzytkownikowi do obu jezykow (EN/PL).

**Kroki implementacji:**
1. Przejrzec `utils/errorLogging.ts` i zidentyfikowac komunikaty user-facing
2. Dodac klucze tlumaczen do `i18n/en/translation.json` i `i18n/pl/translation.json`
3. Utworzyc namespace `errors` dla komunikatow bledow
4. Zaktualizowac komponenty wyswietlajace bledy

**Pliki do modyfikacji:**
- Nowy: `/Users/michalstaniecko/Projects/water-tracker-hydration/i18n/en/errors.json`
- Nowy: `/Users/michalstaniecko/Projects/water-tracker-hydration/i18n/pl/errors.json`
- `/Users/michalstaniecko/Projects/water-tracker-hydration/components/BackupSection.tsx`

---

#### Issue #5: Plik stalych aplikacji
**Priorytet:** Niski
**Zlozonosc:** Mala (0.5 dnia)
**Etykiety:** `technical-debt`, `refactoring`

**Opis:**
Utworzyc centralny plik stalych dla wartosci uzywanych w wielu miejscach aplikacji.

**Kroki implementacji:**
1. Utworzyc `constants/app.ts` z wartosciami:
   - MIN_GLASS_CAPACITY: 50
   - MAX_GLASS_CAPACITY: 475
   - GLASS_STEP: 25
   - DEFAULT_DAILY_GOAL: 2000
   - AUTO_BACKUP_RETENTION_DAYS: 7
2. Zaktualizowac komponenty korzystajace z tych wartosci

**Pliki do modyfikacji:**
- Nowy: `/Users/michalstaniecko/Projects/water-tracker-hydration/constants/app.ts`
- `/Users/michalstaniecko/Projects/water-tracker-hydration/components/AddWater.tsx` (data array)
- `/Users/michalstaniecko/Projects/water-tracker-hydration/stores/setup.ts` (initialState)

---

### Nowe Funkcje (Male)

#### Issue #6: Szybkie akcje - predefiniowane porcje
**Priorytet:** Sredni
**Zlozonosc:** Mala (2 dni)
**Etykiety:** `enhancement`, `feature`

**Opis:**
Dodac szybkie przyciski dla popularnych porcji wody (np. 250ml, 500ml butelka, 330ml puszka).

**Kroki implementacji:**
1. Dodac do setup store tablice `quickActions` z predefiniowanymi porcjami
2. Utworzyc komponent `QuickActions` wyswietlajacy przyciski
3. Dodac mozliwosc personalizacji szybkich akcji w ustawieniach
4. Dodac tlumaczenia

**Nowe pliki:**
- `/Users/michalstaniecko/Projects/water-tracker-hydration/components/QuickActions.tsx`

**Pliki do modyfikacji:**
- `/Users/michalstaniecko/Projects/water-tracker-hydration/stores/setup.ts`
- `/Users/michalstaniecko/Projects/water-tracker-hydration/app/(tabs)/index.tsx`

---

## v1.5.0 - "Stay Reminded"
**Planowany termin:** Q2 2026
**Temat:** System przypomnien i powiadomien push

### Glowne Funkcje

#### Issue #7: Powiadomienia push - Przypomnienia o piciu
**Priorytet:** Wysoki
**Zlozonosc:** Srednia (4-5 dni)
**Etykiety:** `feature`, `notifications`, `engagement`

**Opis:**
Zaimplementowac system przypomnien push zachecajacych do picia wody w konfigurowalnych odstepach czasu.

**Wymagania:**
- expo-notifications (do zainstalowania)
- Konfiguracja uprawnien iOS/Android

**Kroki implementacji:**
1. Zainstalowac `expo-notifications`
2. Utworzyc `stores/notifications.ts` do zarzadzania ustawieniami przypomnien
3. Utworzyc `services/notificationService.ts` do planowania powiadomien
4. Dodac ekran ustawien przypomnien w setup
5. Zaimplementowac inteligentne przypomnienia bazujace na:
   - Konfigurowalnych przedzialach czasowych (co 1h, 2h, 3h)
   - Godzinach aktywnosci uzytkownika (day.startHour - day.endHour)
   - Postepie dziennego celu
6. Dodac obsluge deep linking z powiadomien
7. Dodac tlumaczenia dla tresci powiadomien

**Nowe pliki:**
- `/Users/michalstaniecko/Projects/water-tracker-hydration/stores/notifications.ts`
- `/Users/michalstaniecko/Projects/water-tracker-hydration/services/notificationService.ts`
- `/Users/michalstaniecko/Projects/water-tracker-hydration/app/(tabs)/setup/reminders.tsx`

**Pliki do modyfikacji:**
- `/Users/michalstaniecko/Projects/water-tracker-hydration/package.json`
- `/Users/michalstaniecko/Projects/water-tracker-hydration/app.json` (plugins)
- `/Users/michalstaniecko/Projects/water-tracker-hydration/app/_layout.tsx`

---

#### Issue #8: Inteligentne przypomnienia bazowane na postepie
**Priorytet:** Sredni
**Zlozonosc:** Srednia (3 dni)
**Etykiety:** `feature`, `notifications`, `smart`

**Opis:**
Rozszerzyc system przypomnien o inteligentne sugestie bazowane na aktualnym postepie.

**Logika:**
- Jesli do konca dnia zostalo < 30% czasu i cel < 50% - zwieksz czestotliwosc
- Jesli cel osiagniety - gratulacje i zacheta do utrzymania
- Przypomnienie o serii (streak) rano

**Zaleznosc:** Issue #7

---

#### Issue #9: Widget ekranu glownego (iOS/Android)
**Priorytet:** Sredni
**Zlozonosc:** Duza (5-7 dni)
**Etykiety:** `feature`, `widget`, `engagement`

**Opis:**
Utworzyc widget ekranu glownego pokazujacy dzienny postep i umozliwiajacy szybkie dodanie wody.

**Wymagania:**
- react-native-widget-extension (iOS)
- Android widget implementation

**Kroki implementacji:**
1. Zbadac i wybrac biblioteke do widgetow
2. Zaimplementowac widget iOS z SwiftUI
3. Zaimplementowac widget Android
4. Sync danych miedzy aplikacja a widgetem
5. Akcja "dodaj wode" z poziomu widgetu

**Uwagi:** Ta funkcja wymaga native code i nie moze byc testowana w Expo Go.

---

### Usprawnienia

#### Issue #10: Historia powiadomien w aplikacji
**Priorytet:** Niski
**Zlozonosc:** Mala (1-2 dni)
**Etykiety:** `enhancement`, `notifications`

**Opis:**
Wykorzystac istniejacy system `notifications` w gamification store do wyswietlania historii wszystkich powiadomien.

**Kroki implementacji:**
1. Utworzyc ekran `NotificationsHistory.tsx`
2. Dodac nawigacje do historii z ekranu glownego
3. Grupowanie powiadomien po dniach
4. Oznaczanie jako przeczytane

---

## v1.6.0 - "Personal Touch"
**Planowany termin:** Q3 2026
**Temat:** Personalizacja i tryb ciemny

### Glowne Funkcje

#### Issue #11: Tryb ciemny (Dark Mode)
**Priorytet:** Wysoki
**Zlozonosc:** Srednia (4-5 dni)
**Etykiety:** `feature`, `ui`, `accessibility`

**Opis:**
Zaimplementowac pelny tryb ciemny z mozliwoscia wyboru: systemowy, jasny, ciemny.

**Kroki implementacji:**
1. Rozszerzyc `tailwind.config.js` o warianty dark mode
2. Utworzyc `stores/theme.ts` z preferencjami motywu
3. Zaktualizowac `global.css` o zmienne CSS dla dark mode
4. Zmodyfikowac wszystkie komponenty aby respektowaly tryb
5. Zaktualizowac splash screen i ikony dla dark mode (juz przygotowane w app.json)
6. Dodac przelacznik w ustawieniach

**Pliki do modyfikacji:**
- `/Users/michalstaniecko/Projects/water-tracker-hydration/tailwind.config.js`
- `/Users/michalstaniecko/Projects/water-tracker-hydration/global.css`
- Nowy: `/Users/michalstaniecko/Projects/water-tracker-hydration/stores/theme.ts`
- Wszystkie komponenty UI w `/components/ui/`
- `/Users/michalstaniecko/Projects/water-tracker-hydration/app/(tabs)/setup/index.tsx`

---

#### Issue #12: Rozne typy napojow
**Priorytet:** Sredni
**Zlozonosc:** Srednia (4 dni)
**Etykiety:** `feature`, `personalization`

**Opis:**
Umozliwic sledzenie roznych typow napojow (woda, herbata, kawa, sok) z roznymi wspolczynnikami nawodnienia.

**Kroki implementacji:**
1. Rozszerzyc model danych w `water.ts`:
```typescript
type WaterEntry = {
  amount: number;
  beverageType: 'water' | 'tea' | 'coffee' | 'juice' | 'other';
  hydrationFactor: number; // 1.0 dla wody, 0.8 dla kawy, etc.
  timestamp: string;
};
```
2. Utworzyc `constants/beverages.ts` z typami napojow i wspolczynnikami
3. Zmodyfikowac UI dodawania wody o wybor typu
4. Zaktualizowac statystyki o rozklad typow napojow
5. Migracja istniejacych danych

**Uwaga:** Wymaga migracji schematu danych - stworzyc plan migracji.

---

#### Issue #13: Motywy kolorystyczne
**Priorytet:** Niski
**Zlozonosc:** Mala (2 dni)
**Etykiety:** `feature`, `personalization`

**Opis:**
Umozliwic wybor alternatywnych motywow kolorystycznych (wykorzystac istniejaca palete: mint, peach, lilac, etc.).

**Kroki implementacji:**
1. Zdefiniowac predefiniowane motywy w `constants/themes.ts`
2. Rozszerzyc `stores/theme.ts` o wybor akcentu kolorystycznego
3. Dynamiczne ladowanie kolorow bazujace na wyborze
4. Podglad motywu w ustawieniach

---

#### Issue #14: Zaawansowane cele dzienne
**Priorytet:** Sredni
**Zlozonosc:** Mala (2 dni)
**Etykiety:** `feature`, `personalization`

**Opis:**
Umozliwic ustawienie roznych celow na rozne dni tygodnia.

**Kroki implementacji:**
1. Rozszerzyc `setup.ts` o `weeklyGoals: { [day: number]: string }`
2. Dodac UI do konfiguracji celow per dzien
3. Zaktualizowac logike sprawdzania celu w statystykach i osiagnieciach

---

## v2.0.0 - "Connected Health"
**Planowany termin:** Q4 2026
**Temat:** Integracje zdrowotne i synchronizacja

### Glowne Funkcje

#### Issue #15: Integracja z Apple Health / Google Fit
**Priorytet:** Wysoki
**Zlozonosc:** Duza (7-10 dni)
**Etykiety:** `feature`, `health-integration`, `major`

**Opis:**
Synchronizowac dane nawodnienia z Apple Health (iOS) i Google Fit (Android).

**Wymagania:**
- react-native-health (iOS)
- react-native-google-fit (Android)
- Uprawnienia zdrowotne

**Kroki implementacji:**
1. Zainstalowac odpowiednie biblioteki
2. Utworzyc `services/healthService.ts` jako abstrakcje nad obiema platformami
3. Zaimplementowac eksport danych do Health/Fit
4. Zaimplementowac import danych (opcjonalnie)
5. Dodac ustawienia synchronizacji
6. Obsluga konfliktow danych

**Uwagi:** Wymaga native build, nie dziala w Expo Go.

---

#### Issue #16: Synchronizacja w chmurze (Cloud Sync)
**Priorytet:** Sredni
**Zlozonosc:** Duza (10-14 dni)
**Etykiety:** `feature`, `cloud`, `major`

**Opis:**
Zaimplementowac synchronizacje danych miedzy urzadzeniami przez chmure.

**Opcje backendu:**
- Firebase (Firestore + Auth)
- Supabase
- Custom backend

**Kroki implementacji:**
1. Wybrac i skonfigurowac backend
2. Zaimplementowac autentykacje (email, Google, Apple Sign-In)
3. Utworzyc `services/syncService.ts`
4. Zaimplementowac logike merge'owania danych
5. Obsluga trybu offline
6. UI zarzadzania kontem

**Uwagi:** Duzy zakres pracy, rozwazyc podzial na mniejsze fazy.

---

#### Issue #17: Rekomendacje AI
**Priorytet:** Niski
**Zlozonosc:** Srednia (5-7 dni)
**Etykiety:** `feature`, `ai`, `future`

**Opis:**
Wykorzystac wzorce uzytkownika do generowania spersonalizowanych rekomendacji.

**Przyklady rekomendacji:**
- "Zwykle pijasz mniej w piatki - pamietaj o nawodnieniu!"
- "Swietny postep! Utrzymujesz serie 7 dni."
- Dostosowanie celu bazowane na aktywnosci

**Kroki implementacji:**
1. Utworzyc `services/analyticsService.ts` do analizy wzorcow
2. Zdefiniowac reguly rekomendacji
3. Integracja z systemem powiadomien
4. Opcjonalnie: integracja z LLM API dla bardziej naturalnych komunikatow

---

### Funkcje Spolecznosciowe

#### Issue #18: Wyzwania i Rywalizacja
**Priorytet:** Niski
**Zlozonosc:** Duza (7-10 dni)
**Etykiety:** `feature`, `social`, `gamification`

**Opis:**
Dodac mozliwosc tworzenia wspolnych wyzwan z przyjaciolmi.

**Zaleznosc:** Issue #16 (Cloud Sync)

**Funkcjonalnosci:**
- Tworzenie wyzwan (np. "Kto wypije wiecej w tym tygodniu")
- Zapraszanie znajomych
- Tablica wynikow
- Nagrody za wyzwania

---

#### Issue #19: Udostepnianie osiagniec
**Priorytet:** Niski
**Zlozonosc:** Mala (2 dni)
**Etykiety:** `feature`, `social`

**Opis:**
Umozliwic udostepnianie osiagniec w mediach spolecznosciowych.

**Kroki implementacji:**
1. Generowanie grafiki osiagniecia (react-native-view-shot)
2. Integracja z expo-sharing
3. Szablony dla roznych platform

---

## v2.1.0 - "Advanced Analytics"
**Planowany termin:** Q1 2027
**Temat:** Zaawansowane analizy i wnioski

### Funkcje

#### Issue #20: Zaawansowane wnioski (Insights)
**Priorytet:** Sredni
**Zlozonosc:** Srednia (4-5 dni)
**Etykiety:** `feature`, `analytics`

**Opis:**
Rozbudowac ekran statystyk o glebsze analizy i trendy.

**Nowe metryki:**
- Trendy dlugookresowe (3 miesiace, 6 miesiecy, rok)
- Najlepsze/najgorsze dni tygodnia
- Wplyw pogody na nawodnienie (integracja z weather API)
- Porownanie z poprzednimi okresami
- Predykcja osiagniecia celu

---

#### Issue #21: Eksport raportow PDF
**Priorytet:** Niski
**Zlozonosc:** Mala (2-3 dni)
**Etykiety:** `feature`, `export`

**Opis:**
Umozliwic generowanie raportow PDF ze statystykami.

**Kroki implementacji:**
1. Zainstalowac biblioteke do generowania PDF
2. Zaprojektowac szablon raportu
3. Wygenerowac wykresy jako obrazy
4. Eksport i udostepnianie

---

## Dlugoterminowa Wizja (v3.0+)

### Potencjalne Funkcje
- **Integracja z wearables** (Apple Watch, WearOS) - natywne aplikacje
- **Sledzenie nawodnienia w czasie rzeczywistym** z inteligentnymi butelkami (IoT)
- **Gamifikacja rozszerzona** - awatary, sklep z nagrodami, sezonowe wydarzenia
- **Wersja Premium** - usuniecie reklam, zaawansowane funkcje
- **Integracja z aplikacjami fitness** (Strava, Nike Run Club)

---

## Zaleznosci Miedzy Funkcjami

```
v1.4.0 (Quick Wins)
  |
  v
v1.5.0 (Notifications)
  |-- Issue #7 (Push) --> Issue #8 (Smart)
  |                   --> Issue #10 (History)
  |
  v
v1.6.0 (Personalization)
  |-- Issue #11 (Dark Mode)
  |-- Issue #12 (Beverages)
  |
  v
v2.0.0 (Connected Health)
  |-- Issue #16 (Cloud) --> Issue #18 (Social)
  |-- Issue #15 (Health)
  |
  v
v2.1.0 (Analytics)
```

---

## Priorytety i Kolejnosc Implementacji

### Wysoki Priorytet (Natychmiastowe)
1. Issue #1 - TypeScript fix (blokuje rozwoj)
2. Issue #2 - Haptic feedback (szybka wygrana)
3. Issue #7 - Push notifications (kluczowe dla retencji)
4. Issue #11 - Dark mode (czesto zglaszane)

### Sredni Priorytet (Planowane)
5. Issue #3 - Loading states
6. Issue #6 - Quick actions
7. Issue #12 - Beverage types
8. Issue #15 - Health integration

### Niski Priorytet (Backlog)
9. Issue #5 - Constants file
10. Issue #13 - Color themes
11. Issue #17 - AI recommendations
12. Issue #18 - Social challenges

---

## Notatki Techniczne

### Biblioteki do Rozwazeenia
```json
{
  "expo-notifications": "Powiadomienia push",
  "react-native-health": "Apple Health",
  "react-native-google-fit": "Google Fit",
  "react-native-view-shot": "Generowanie grafik",
  "react-native-pdf-lib": "Generowanie PDF",
  "firebase": "Cloud sync i auth",
  "react-native-widget-extension": "Widgety iOS"
}
```

### Migracje Danych
Przy wprowadzaniu Issue #12 (Beverage Types) wymagana bedzie migracja schematu:
1. Dodac pole `version` do storage
2. Utworzyc skrypt migracji
3. Zachowac kompatybilnosc wsteczna

### Testowanie
Dla kazdej nowej funkcji:
1. Testy jednostkowe (Jest)
2. Testy integracyjne dla store'ow
3. Manualne testy na iOS i Android
4. Testy regresji istniejacych funkcji

---

## Szablon Issue dla GitHub

```markdown
## [Typ]: [Nazwa Funkcji]

### Opis
[Krotki opis funkcji]

### Problem do Rozwiazania
[Jaki problem uzytkownika rozwiazujemy?]

### Proponowane Rozwiazanie
[Techniczny opis rozwiazania]

### Kryteria Akceptacji
- [ ] Kryterium 1
- [ ] Kryterium 2
- [ ] Testy napisane
- [ ] Dokumentacja zaktualizowana
- [ ] Tlumaczenia dodane (EN/PL)

### Zlozonosc
- [ ] Mala (1-2 dni)
- [ ] Srednia (3-5 dni)
- [ ] Duza (1-2 tygodnie)

### Zaleznosci
- Brak / Lista zaleznych issue

### Pliki do Modyfikacji
- `sciezka/do/pliku.tsx`
```

---

*Dokument zostanie zaktualizowany wraz z postepem prac i feedbackiem uzytkownikow.*
