import { DATA_NOTE, type FamilyHeuristic } from "./types";

export const familyHeuristics: FamilyHeuristic[] = [
  {
    family: "invention-assignment",
    familyName: "Invention Assignment",
    baseline:
      "Employers may own inventions made on the job with company resources, but many states limit assignment of inventions made entirely on the employee's own time without employer resources, and California expressly voids clauses reaching those inventions.",
    rubric: [
      {
        question: "Does the clause capture inventions made on the employee's own time, without employer equipment or confidential information?",
        redFlag: "Assigns the employee's personal and side-project inventions to the employer — void in states like California (Cal. Lab. Code § 2870) and limited in many others",
      },
      {
        question: "Is the assignment limited to work within the scope of employment and reasonably related to the employer's business?",
        redFlag: "'All inventions conceived during employment, whether or not related to the company's business' — classic overreach",
      },
      {
        question: "Is there any carve-out for prior inventions listed in an exhibit?",
        redFlag: "No prior-inventions schedule, or a clause that silently swallows it ('whether disclosed or not')",
      },
      {
        question: "Does the clause last beyond the employment relationship itself?",
        redFlag: "Assigning inventions conceived 'during or after' employment extends ownership rights past the job — courts narrow or strike these",
      },
    ],
  },
  {
    family: "forfeiture-for-competition",
    familyName: "Forfeiture-for-Competition",
    baseline:
      "These clauses forfeit earned compensation (bonuses, equity, commissions) if the employee competes. Because they claw back money already earned, many courts treat them as penalties and scrutinize them harder than ordinary non-competes.",
    rubric: [
      {
        question: "Does it forfeit compensation the employee has already earned?",
        redFlag: "Forfeiting vested equity or an earned bonus is treated as a penalty in many states; unvested amounts are far more defensible",
      },
      {
        question: "Is the forfeited amount proportionate to the employer's actual protectable interest?",
        redFlag: "Total forfeiture of a large, already-earned sum with no cap — smells like a penalty, not protection of goodwill or trade secrets",
      },
      {
        question: "Is the triggering 'competition' defined narrowly?",
        redFlag: "Any employment in the same industry, in any role, anywhere — the clause effectively buys a career change, and courts discount it accordingly",
      },
      {
        question: "Does the plan document that creates the award clearly disclose the forfeiture term?",
        redFlag: "Buried in a separate agreement never shown to the employee at grant time — enforceability and fair-dealing problems",
      },
    ],
  },
  {
    family: "garden-leave",
    familyName: "Garden Leave",
    baseline:
      "Garden leave pays the employee (or pays them a fraction) to stay out of the market during the restricted period. Paid garden leave is broadly respected; unpaid 'garden leave' is just an unpaid non-compete.",
    rubric: [
      {
        question: "Is the employee actually paid during the restricted period?",
        redFlag: "Zero or token compensation during the restriction — it is a non-compete wearing garden-leave branding",
      },
      {
        question: "Is the pay a meaningful fraction of prior compensation (commonly at least 50%)?",
        redFlag: "10–30% of base salary to sit out a full year — states like Oregon require 50%+ or other agreed consideration",
      },
      {
        question: "Is the duration tied to the notice period the employer actually needs?",
        redFlag: "Longer than the employer's legitimate need to transition work or protect information",
      },
      {
        question: "Does the clause keep the employee's duties and pay defined rather than discretionary?",
        redFlag: "'The company may assign duties and adjust compensation in its sole discretion' — employer discretion becomes the employee's risk",
      },
    ],
  },
  {
    family: "non-solicitation",
    familyName: "Non-Solicitation (incl. Antipiracy)",
    baseline:
      "Non-solicitation clauses bar poaching customers or coworkers. They are generally more enforceable than non-competes when drawn from the employee's actual contacts, but blanket versions fail, and several states ban them for lower-wage workers.",
    rubric: [
      {
        question: "Does the customer restriction cover only accounts the employee actually worked on or learned about?",
        redFlag: "'Any customer of the company, known or unknown to employee' — courts in states like New York narrow these to the employee's actual contacts",
      },
      {
        question: "Is 'solicit' defined, or does even a passive inbound call count?",
        redFlag: "A ban on 'accepting business' from former customers reaches work the employee never initiated — routinely struck or narrowed",
      },
      {
        question: "Is the employee-recruitment (antipiracy) restriction limited to people the employee worked with or supervised?",
        redFlag: "Bars recruiting any company employee worldwide for years — overbroad antipiracy",
      },
      {
        question: "Is the duration proportionate (commonly 1–2 years)?",
        redFlag: "5+ year tails for customer solicitation exceed anything most courts will sustain for an ordinary employee",
      },
      {
        question: "Could the clause trap lower-wage workers?",
        redFlag: "States like Illinois (below $15,000/yr) and others ban non-solicitation covenants for low earners",
      },
    ],
  },
  {
    family: "unlimited-scope-nda",
    familyName: "Unlimited-Scope NDA",
    baseline:
      "A confidential-information clause is enforceable when it protects genuinely non-public information. Problems start when the definition swallows public knowledge, professional skills, or lasts forever.",
    rubric: [
      {
        question: "Does the definition of confidential information exclude what is publicly known or independently developed?",
        redFlag: "'Any and all information disclosed or learned during employment' with no public-knowledge carve-out — courts refuse to enforce as written",
      },
      {
        question: "Is there a trade-secrets carve-out and a residual-knowledge allowance?",
        redFlag: "No carve-out for general skills, knowledge, and experience the employee must be able to use to earn a living",
      },
      {
        question: "Is the duration finite?",
        redFlag: "'In perpetuity' or 'for as long as the information remains confidential, as determined by the company' — employer discretion sets the clock",
      },
      {
        question: "Does it cover the employee's own general professional knowledge?",
        redFlag: "Banning use of 'any knowledge or skills acquired during employment' — that is a non-compete in NDA clothing",
      },
    ],
  },
];

export { DATA_NOTE };
