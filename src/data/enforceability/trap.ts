import { DATA_NOTE, type TrapProfile } from "./types";

export const defaultTrapNote =
  "States without TRAP-specific statutes still offer defenses: the common-law penalty doctrine voids repayment amounts that grossly exceed actual costs (liquidated damages must be a reasonable forecast of loss, not a deterrent), wage-deduction and wage-assignment laws generally require voluntary written consent and bar deducting from final paychecks, and courts increasingly treat harsh repayment schedules as de facto non-competes that must survive restraint-of-trade analysis.";

export const trapProfiles: TrapProfile[] = [
  {
    state: "CA",
    stateName: "California",
    scope: "All employees; repayment obligations that function as restraints on leaving",
    keyProtections: [
      "A repayment clause that effectively punishes resignation can be void under the same statute that bans non-competes",
      "The penalty doctrine voids liquidated damages disproportionate to the employer's actual loss — training cost must be reasonably estimated, not a scare number",
      "Employers must give written notice that void restraints are unenforceable, and can face penalties for failing to",
      "Wage assignments for such debts are sharply limited; employers generally cannot just dock the final paycheck",
    ],
    citations: ["Cal. Bus. & Prof. Code § 16600", "Cal. Lab. Code § 1671 (penalty doctrine)", "Cal. Bus. & Prof. Code § 16600.1 (AB 1076 notice)"],
    note: "California has no TRAP-specific statute, but § 16600 plus the penalty doctrine makes aggressive training repayment agreements highly vulnerable; the 2023/2024 non-compete notice laws reach clauses that operate like non-competes.",
  },
  {
    state: "IL",
    stateName: "Illinois",
    scope: "Employees earning at or below $45,000 per year get the strongest shield; all employees get wage-deduction protections",
    keyProtections: [
      "Forbids non-compete-style restrictions for lower-wage employees, and Illinois regulators scrutinize repayment clauses that function the same way",
      "Wage deductions require informed, voluntary written consent — coerced deductions from wages or final pay violate the Wage Payment and Collection Act",
      "The penalty doctrine limits repayment amounts to a reasonable estimate of the employer's actual training investment",
    ],
    citations: ["820 ILCS 90 (Illinois Freedom to Work Act)", "820 ILCS 115/9 (Wage Payment and Collection Act)"],
    note: "Illinois's statutory floor for non-competes signals hostility to repayment clauses operating as restraints for lower-wage workers.",
  },
  {
    state: "MN",
    stateName: "Minnesota",
    scope: "Employees signing on or after July 1, 2023",
    keyProtections: [
      "Minnesota's 2023 non-compete ban reflects a strong policy against restraints on voluntary mobility, and TRAPs that operate like non-competes draw the same skepticism",
      "Wage deductions require written authorization under Minnesota wage-payment law; repayment cannot simply be carved out of a paycheck",
      "The penalty doctrine caps recovery at a reasonable forecast of actual loss",
    ],
    citations: ["Minn. Stat. § 181.988 (2023)"],
    note: "The 2023 ban does not name TRAPs expressly as of this snapshot; challenges run through penalty doctrine, wage-deduction consent, and restraint-of-trade analysis.",
  },
  {
    state: "NJ",
    stateName: "New Jersey",
    scope: "All employees; healthcare workers have additional pending legislative attention",
    keyProtections: [
      "The New Jersey Wage Payment Law requires written consent for deductions beyond statutory exceptions — an employer cannot recoup training costs from wages without it",
      "The penalty doctrine voids repayment terms designed to deter resignation rather than recover actual costs",
      "Courts read restraints of trade narrowly; a repayment obligation with a long tail and escalating amounts looks like a non-compete and must satisfy reasonableness",
    ],
    citations: ["N.J.S.A. 34:11-4.1 et seq. (Wage Payment Law)"],
    note: "As of this snapshot New Jersey has TRAP-limiting bills pending rather than enacted; wage-deduction consent and penalty doctrine carry the defense.",
  },
  {
    state: "WA",
    stateName: "Washington",
    scope: "All employees, with heightened concern for lower-wage and healthcare workers",
    keyProtections: [
      "Deductions from wages without the employee's written consent can expose the employer to statutory penalties",
      "The penalty doctrine limits training repayment to a reasonable estimate of actual, verifiable costs",
      "Washington's non-compete statute shows the state's policy: restraints on voluntary departure face strict conditions; repayment clauses that bind workers below earnings thresholds are prime targets for challenge",
    ],
    citations: ["RCW 49.52.050", "RCW 49.52.070"],
    note: "TRAP-limiting legislation has been introduced repeatedly but was not enacted as of this snapshot; enforcement defense runs through wage-deduction and penalty doctrine.",
  },
];

export { DATA_NOTE };
