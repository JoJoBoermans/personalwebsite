# Text wireframes

## Homepage desktop

```text
┌───────────────────────────────────────────────────────────────┐
│ ShelfSketch        Tool  How it works  Guides  About  [Start]│
├───────────────────────────────────────────────────────────────┤
│ SEE WHAT FITS BEFORE YOU BUY.      ┌────────────────────────┐ │
│ Enter shelf and bin dimensions.    │ animated shelf example │ │
│ [Start planning] [Try an example]  └────────────────────────┘ │
├───────────────────────────────────────────────────────────────┤
│ 1 Measure          2 Add bins          3 Compare layouts      │
├───────────────────────────────────────────────────────────────┤
│ Use cases: Pantry | Closet | Bathroom | Toys | Hobby          │
├───────────────────────────────────────────────────────────────┤
│ Avoid wrong sizes | Compare layouts | Private | No account    │
├───────────────────────────────────────────────────────────────┤
│ Guides cards                                                   │
├───────────────────────────────────────────────────────────────┤
│ Footer                                                         │
└───────────────────────────────────────────────────────────────┘
```

## Tool desktop

```text
┌───────────────────────────────────────────────────────────────┐
│ Header                                                        │
├───────────────────────────────┬───────────────────────────────┤
│ Project / steps               │ Layout tabs                   │
│                               │ [Compact][Easy][Balanced]     │
│ 1 Space                       │ ┌───────────────────────────┐ │
│ width [  ] height [  ]        │ │ accessible scaled SVG     │ │
│ depth [  ] unit [cm]          │ │                           │ │
│ gaps [  ] [  ]                │ └───────────────────────────┘ │
│                               │ Result summary                │
│ 2 Items                       │ Selected-object controls      │
│ [item card]                   │ [←][→][↑][↓][Rotate][Remove]  │
│ [+ Add item]                  │                               │
│                               │ [Save] [Export] [Print]       │
│ [Generate layouts]            │ Disclaimer                    │
├───────────────────────────────┴───────────────────────────────┤
│ Footer                                                        │
└───────────────────────────────────────────────────────────────┘
```

## Tool mobile

```text
┌──────────────────────────┐
│ ShelfSketch       Menu   │
├──────────────────────────┤
│ Step 1 of 5: Space       │
│ [progress indicator]     │
│                          │
│ width                    │
│ [ numeric input       ]  │
│ height                   │
│ [ numeric input       ]  │
│ depth                    │
│ [ numeric input       ]  │
│                          │
│ [Continue: add items]    │
└──────────────────────────┘
```

Results become a full-width panel with tabs above the SVG and a sticky action bar below. Manual controls are explicit labeled buttons; drag is optional.

## Error state

```text
No items fit with the current measurements.

• Large bin is 18 mm too deep.
• Small box is 12 mm too tall after the top clearance is applied.

[Edit measurements] [Review items]
```

## Empty state

A small illustrated shelf plus one sentence and two actions:

- Add your first item
- Load the example
