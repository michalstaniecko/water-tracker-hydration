# Plan Rozwoju Aplikacji Water Tracker Hydration

> **Wersja dokumentu:** 1.0
> **Data utworzenia:** 2026-01-04
> **Aktualna wersja aplikacji:** 1.3.4

---

## Spis treści

1. [Podsumowanie obecnego stanu](#podsumowanie-obecnego-stanu)
2. [Faza 1: Ulepszenia podstawowe](#faza-1-ulepszenia-podstawowe)
3. [Faza 2: Rozbudowa funkcjonalności](#faza-2-rozbudowa-funkcjonalności)
4. [Faza 3: Integracje zewnętrzne](#faza-3-integracje-zewnętrzne)
5. [Faza 4: Funkcje społecznościowe i premium](#faza-4-funkcje-społecznościowe-i-premium)
6. [Backlog techniczny](#backlog-techniczny)
7. [Priorytety i zależności](#priorytety-i-zależności)

---

## Podsumowanie obecnego stanu

### Zaimplementowane funkcje

| Funkcja | Status | Opis |
|---------|--------|------|
| Śledzenie wody | ✅ Gotowe | Dodawanie/usuwanie wody, historia |
| Grywalizacja | ✅ Gotowe | 11 osiągnięć, streak, powiadomienia |
| Statystyki | ✅ Gotowe | Widok tygodniowy/miesięczny, wykresy |
| Backup danych | ✅ Gotowe | JSON/CSV eksport/import, auto-backup |
| Internacjonalizacja | ✅ Gotowe | Polski, Angielski |
| Monetyzacja | ✅ Gotowe | Google Mobile Ads |
| Onboarding | ✅ Gotowe | Interaktywny tutorial |
| Testowanie | ✅ Gotowe | 51 testów (jednostkowe + integracyjne) |

### Używane technologie

- **Framework:** React Native 0.79.6 + Expo 53
- **Stan:** Zustand 5.0.3
- **Stylowanie:** NativeWind + TailwindCSS
- **Nawigacja:** Expo Router 5.1.7
- **Język:** TypeScript 5.3.3

---

## Faza 1: Ulepszenia podstawowe

> **Cel:** Poprawa codziennego doświadczenia użytkownika
> **Priorytet:** Wysoki

### 1.1 Powiadomienia push o nawodnieniu

**Opis:** Przypomnienia o piciu wody w regularnych odstępach czasu.

**Zadania:**
- [ ] Integracja z `expo-notifications`
- [ ] Ekran ustawień powiadomień (częstotliwość, godziny ciszy)
- [ ] Logika inteligentnych przypomnień (nie przypominaj gdy cel osiągnięty)
- [ ] Lokalizacja treści powiadomień
- [ ] Obsługa uprawnień na iOS/Android

**Technologie:** `expo-notifications`, `expo-task-manager`

**Szacowana złożoność:** Średnia

---

### 1.2 Tryb ciemny (Dark Mode)

**Opis:** Automatyczny lub ręczny tryb ciemny dla komfortu użytkownika.

**Zadania:**
- [ ] Utworzenie palety kolorów dla trybu ciemnego
- [ ] Hook `useColorScheme` dla automatycznego wykrywania
- [ ] Przełącznik w ustawieniach (Auto/Jasny/Ciemny)
- [ ] Aktualizacja wszystkich komponentów UI
- [ ] Ikony adaptacyjne dla obu trybów

**Technologie:** `react-native-appearance`, NativeWind dark mode utilities

**Szacowana złożoność:** Średnia

---

### 1.3 Widget na ekran główny

**Opis:** Natywny widget pokazujący dzienny postęp nawodnienia.

**Zadania:**
- [ ] Widget iOS (WidgetKit via Expo)
- [ ] Widget Android (App Widget)
- [ ] Synchronizacja danych między aplikacją a widgetem
- [ ] Akcja szybkiego dodawania wody z widgetu
- [ ] Różne rozmiary widgetów (mały, średni, duży)

**Technologie:** `react-native-widget-extension`, `expo-widgets`

**Szacowana złożoność:** Wysoka

---

### 1.4 Dodatkowe języki

**Opis:** Rozszerzenie wsparcia językowego.

**Proponowane języki (priorytet):**
1. Niemiecki (de)
2. Hiszpański (es)
3. Francuski (fr)
4. Ukraiński (uk)
5. Włoski (it)

**Zadania:**
- [ ] Utworzenie plików tłumaczeń dla każdego języka
- [ ] Tłumaczenie wszystkich namespace'ów (common, home, stats, achievements, setup, backup, history)
- [ ] Walidacja tłumaczeń przez native speakerów
- [ ] Aktualizacja pickera języków w ustawieniach

**Szacowana złożoność:** Niska (per język)

---

### 1.5 Haptic feedback

**Opis:** Wibracyjne potwierdzenia akcji dla lepszego UX.

**Zadania:**
- [ ] Wibracja przy dodawaniu wody
- [ ] Wibracja przy odblokowaniu osiągnięcia
- [ ] Wibracja przy osiągnięciu dziennego celu
- [ ] Opcja wyłączenia w ustawieniach

**Technologie:** `expo-haptics`

**Szacowana złożoność:** Niska

---

## Faza 2: Rozbudowa funkcjonalności

> **Cel:** Bardziej zaawansowane śledzenie i personalizacja
> **Priorytet:** Średni

### 2.1 Niestandardowe napoje

**Opis:** Śledzenie różnych napojów z różnym wpływem na nawodnienie.

**Funkcje:**
- Woda (100% nawodnienia)
- Herbata (95% nawodnienia)
- Kawa (85% nawodnienia - efekt diuretyczny)
- Sok (90% nawodnienia)
- Napoje gazowane (80% nawodnienia)
- Napoje własne użytkownika

**Zadania:**
- [ ] Model danych dla typów napojów
- [ ] Rozszerzenie store'a water o typ napoju
- [ ] UI do wyboru napoju przy dodawaniu
- [ ] Zarządzanie własnymi napojami w ustawieniach
- [ ] Aktualizacja statystyk i wykresów
- [ ] Migracja danych historycznych

**Struktura danych:**
```typescript
interface Beverage {
  id: string;
  name: string;
  hydrationFactor: number; // 0.0 - 1.0
  icon: string;
  color: string;
  isDefault: boolean;
}
```

**Szacowana złożoność:** Wysoka

---

### 2.2 Cele dynamiczne

**Opis:** Automatyczne dostosowanie dziennego celu na podstawie czynników.

**Czynniki wpływające:**
- Waga użytkownika
- Poziom aktywności fizycznej
- Pogoda (temperatura, wilgotność)
- Płeć
- Wiek

**Zadania:**
- [ ] Formularz profilu użytkownika
- [ ] Algorytm obliczania zalecanego spożycia
- [ ] Integracja z API pogodowym (opcjonalnie)
- [ ] Wyjaśnienie rekomendacji dla użytkownika
- [ ] Możliwość nadpisania automatycznego celu

**Szacowana złożoność:** Średnia

---

### 2.3 Rozbudowa statystyk

**Opis:** Bardziej szczegółowe analizy wzorców picia.

**Nowe metryki:**
- Średni czas między piciem
- Najbardziej/najmniej aktywne godziny
- Porównanie tydzień do tygodnia
- Porównanie miesiąc do miesiąca
- Trendy długoterminowe
- Prognoza osiągnięcia celu

**Nowe wykresy:**
- Wykres kołowy (rozkład napojów)
- Heatmapa (aktywność godzinowa)
- Wykres słupkowy (porównawczy)

**Zadania:**
- [ ] Rozszerzenie statistics store
- [ ] Nowe komponenty wykresów
- [ ] Filtrowanie okresów czasowych
- [ ] Eksport raportów do PDF

**Technologie:** `react-native-gifted-charts`, `expo-print`

**Szacowana złożoność:** Średnia

---

### 2.4 Nowe osiągnięcia

**Opis:** Rozbudowa systemu grywalizacji o nowe osiągnięcia.

**Proponowane osiągnięcia:**

| Osiągnięcie | Opis | Warunek |
|-------------|------|---------|
| Early Bird | Wypij wodę przed 7:00 | 7 dni z rzędu |
| Night Owl | Nawodnij się po 21:00 | 7 dni z rzędu |
| Perfect Month | 100% celu przez miesiąc | 30 dni streak |
| Hydration Master | 200 litrów łącznie | Suma wody |
| Comeback King | Wróć po przerwie | 7 dni po 14 dniach nieaktywności |
| Speed Drinker | Osiągnij cel przed 14:00 | 5 razy |
| Consistency Pro | Pij równomiernie przez dzień | 10 dni |

**Zadania:**
- [ ] Implementacja nowych warunków w gamification store
- [ ] Nowe ikony/grafiki osiągnięć
- [ ] Aktualizacja tłumaczeń
- [ ] System poziomów osiągnięć (brąz/srebro/złoto)

**Szacowana złożoność:** Niska

---

### 2.5 Dziennik wodny

**Opis:** Szczegółowy widok historii z możliwością edycji.

**Funkcje:**
- Kalendarz z zaznaczonymi dniami
- Widok szczegółowy dnia (każde picie z godziną)
- Edycja/usuwanie wpisów historycznych
- Notatki do dnia (np. "choroba", "trening")

**Zadania:**
- [ ] Komponent kalendarza
- [ ] Rozszerzenie modelu danych o dokładny czas
- [ ] UI edycji historii
- [ ] System tagów/notatek

**Szacowana złożoność:** Średnia

---

## Faza 3: Integracje zewnętrzne

> **Cel:** Połączenie z ekosystemem zdrowotnym użytkownika
> **Priorytet:** Średni

### 3.1 Integracja Apple Health / Google Fit

**Opis:** Synchronizacja danych z natywnymi aplikacjami zdrowia.

**Funkcje:**
- Eksport danych nawodnienia do Health/Fit
- Import danych o aktywności (dla dynamicznych celów)
- Import wagi użytkownika
- Synchronizacja automatyczna

**Zadania:**
- [ ] Integracja `react-native-health` (iOS)
- [ ] Integracja `react-native-google-fit` (Android)
- [ ] Obsługa uprawnień i zgód
- [ ] Konfiguracja w ustawieniach
- [ ] Rozwiązanie konfliktów danych

**Technologie:** `react-native-health`, `react-native-google-fit`

**Szacowana złożoność:** Wysoka

---

### 3.2 Synchronizacja w chmurze

**Opis:** Synchronizacja danych między urządzeniami.

**Opcje implementacji:**

**A) Firebase (rekomendowane)**
- Firestore dla danych
- Firebase Auth dla kont
- Sync w czasie rzeczywistym

**B) Własny backend**
- Pełna kontrola nad danymi
- Wyższe koszty utrzymania
- GDPR compliance

**Zadania:**
- [ ] System uwierzytelniania (email, Google, Apple)
- [ ] Model danych dla synchronizacji
- [ ] Logika merge'owania konfliktów
- [ ] Tryb offline-first
- [ ] Ustawienia prywatności

**Technologie:** Firebase SDK, AsyncStorage (fallback)

**Szacowana złożoność:** Wysoka

---

### 3.3 Integracja z asystentami głosowymi

**Opis:** Sterowanie aplikacją głosem.

**Komendy głosowe:**
- "Dodaj szklankę wody"
- "Ile wody wypiłem dzisiaj?"
- "Jaki mam cel na dziś?"

**Platformy:**
- Siri Shortcuts (iOS)
- Google Assistant (Android)

**Zadania:**
- [ ] Expo Siri Shortcuts integration
- [ ] Android App Actions
- [ ] Definiowanie intents
- [ ] Odpowiedzi głosowe

**Szacowana złożoność:** Średnia

---

### 3.4 Integracja ze smartwatchami

**Opis:** Companion app dla smartwatchy.

**Platformy:**
- Apple Watch
- Wear OS

**Funkcje:**
- Szybkie dodawanie wody
- Widok postępu
- Komplikacje zegarka
- Powiadomienia

**Zadania:**
- [ ] Apple Watch app (SwiftUI)
- [ ] Wear OS app (Kotlin/Compose)
- [ ] Watch Connectivity SDK
- [ ] Sync danych

**Szacowana złożoność:** Bardzo wysoka

---

## Faza 4: Funkcje społecznościowe i premium

> **Cel:** Budowanie społeczności i monetyzacja
> **Priorytet:** Niski (długoterminowy)

### 4.1 Wyzwania i rankingi

**Opis:** Funkcje społecznościowe motywujące do nawodnienia.

**Funkcje:**
- Wyzwania tygodniowe/miesięczne
- Rankingi znajomych
- Dzielenie osiągnięć
- Zespołowe cele

**Zadania:**
- [ ] Backend dla funkcji społecznościowych
- [ ] System znajomych
- [ ] UI rankingów
- [ ] Powiadomienia o aktywności znajomych
- [ ] Prywatność i moderacja

**Szacowana złożoność:** Bardzo wysoka

---

### 4.2 Wersja Premium

**Opis:** Model subskrypcyjny z dodatkowymi funkcjami.

**Funkcje Premium:**
- Brak reklam
- Zaawansowane statystyki
- Ekskluzywne osiągnięcia
- Nieograniczona historia
- Motywy kolorystyczne
- Synchronizacja w chmurze
- Priorytetowe wsparcie

**Model cenowy:**
- Miesięczny: $1.99
- Roczny: $9.99 (60% oszczędności)
- Dożywotni: $29.99

**Zadania:**
- [ ] Integracja In-App Purchases
- [ ] System uprawnień premium
- [ ] Restore purchases
- [ ] Trial period
- [ ] Analytics konwersji

**Technologie:** `expo-in-app-purchases`, RevenueCat

**Szacowana złożoność:** Wysoka

---

### 4.3 Program partnerski marek

**Opis:** Współpraca z markami butelek, wody mineralnej.

**Możliwości:**
- Sponsorowane osiągnięcia
- Branded themes
- Kupony i rabaty
- Konkursy z nagrodami

**Szacowana złożoność:** Biznesowa (nie techniczna)

---

## Backlog techniczny

> **Cel:** Utrzymanie jakości kodu i skalowalności

### Wysokie priorytety

| Zadanie | Opis | Status |
|---------|------|--------|
| Fix TypeScript error | Naprawienie `@ts-ignore` w `_layout.tsx:18` | Do zrobienia |
| PickerWheel TODOs | Usunięcie placeholder TODO w `PickerWheel.tsx` | Do zrobienia |
| Zwiększenie pokrycia testami | Backup.ts z 58% do 80% | Do zrobienia |
| Sentry integration | Monitoring błędów produkcyjnych | Do zrobienia |
| Performance monitoring | Firebase Performance / New Relic | Do zrobienia |

### Średnie priorytety

| Zadanie | Opis | Status |
|---------|------|--------|
| E2E testing | Detox / Maestro testy end-to-end | Do zrobienia |
| Accessibility | Wsparcie VoiceOver / TalkBack | Do zrobienia |
| Bundle size optimization | Analiza i optymalizacja rozmiaru | Do zrobienia |
| Code splitting | Lazy loading ekranów | Do zrobienia |
| Security audit | Przegląd bezpieczeństwa | Do zrobienia |

### Niskie priorytety

| Zadanie | Opis | Status |
|---------|------|--------|
| Storybook | Dokumentacja komponentów | Do zrobienia |
| API documentation | OpenAPI spec (gdy będzie backend) | Do zrobienia |
| Automated releases | Semantic versioning + changelog | Do zrobienia |

---

## Priorytety i zależności

```
                    PRIORYTETY ROZWOJU

    WYSOKI          ŚREDNI          NISKI
    ━━━━━━          ━━━━━━          ━━━━━━
       │               │               │
       ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Powiadomienia│ │  Niestandardowe │ │  Wyzwania    │
│    push      │ │    napoje    │ │ społecznościowe│
└──────────────┘ └──────────────┘ └──────────────┘
       │               │               │
       ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Dark mode   │ │ Dynamiczne   │ │   Premium    │
│              │ │    cele      │ │   wersja     │
└──────────────┘ └──────────────┘ └──────────────┘
       │               │               │
       ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Widget     │ │ Health/Fit   │ │ Smartwatch   │
│              │ │ integracja   │ │     app      │
└──────────────┘ └──────────────┘ └──────────────┘
       │               │
       ▼               ▼
┌──────────────┐ ┌──────────────┐
│Dodatkowe     │ │ Cloud sync   │
│  języki      │ │              │
└──────────────┘ └──────────────┘
```

### Graf zależności

```
Powiadomienia push ──┐
                     ├──▶ Widget (wymaga shared data)
Dark mode ───────────┘

Niestandardowe napoje ──┬──▶ Rozbudowa statystyk
                        │
                        └──▶ Dziennik wodny

Cloud sync ──┬──▶ Funkcje społecznościowe
             │
             └──▶ Multi-device support

Health/Fit ──▶ Dynamiczne cele

Premium ──▶ Wymaga większości funkcji Fazy 2-3
```

---

## Metryki sukcesu

### KPI dla każdej fazy

| Faza | Metryka | Cel |
|------|---------|-----|
| 1 | Dzienna retencja | +15% |
| 1 | Ocena w sklepie | 4.5+ |
| 2 | Średni czas sesji | +20% |
| 2 | DAU/MAU ratio | +10% |
| 3 | Użytkownicy z integracją | 30% |
| 4 | Konwersja na premium | 5% |

---

## Podsumowanie

Ten plan rozwoju zapewnia stopniową ewolucję aplikacji Water Tracker Hydration od solidnej aplikacji do śledzenia nawodnienia do kompleksowej platformy zdrowotnej. Kluczowe jest:

1. **Zachowanie prostoty** - nie komplikuj podstawowego flow dodawania wody
2. **Iteracyjne podejście** - każda faza buduje na poprzedniej
3. **Feedback użytkowników** - weryfikuj priorytety z realnym feedbackiem
4. **Jakość kodu** - utrzymuj testy i dokumentację

---

*Ostatnia aktualizacja: 2026-01-04*
