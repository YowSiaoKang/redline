export interface SampleContract {
  id: string;
  title: string;
  blurb: string;
  text: string;
}

export const sampleContracts: SampleContract[] = [
  {
    id: "offer-letter",
    title: "The Offer Letter",
    blurb: "Your first day starts in the fine print.",
    text: `OFFER OF EMPLOYMENT

This letter confirms the offer of employment extended to you by the Company. By signing below, you accept the terms set out herein.

1. Position and Start Date. You will serve in a full-time exempt position, reporting to the Head of Department, with a start date to be agreed in writing.

2. Compensation. Your starting salary will be paid semi-monthly, less applicable withholdings, and you will be eligible for the Company's standard benefits package.

3. At-Will Employment. Your employment is at will. Either you or the Company may end the employment relationship at any time, with or without cause or notice.`,
  },
  {
    id: "training-agreement",
    title: "The Training Agreement",
    blurb: "They pay for the course. You may pay it back.",
    text: `TRAINING AGREEMENT

This Training Agreement is made between the Employee and the Company in connection with the training program described below.

1. Program. The Employee agrees to complete the training program and any assessments associated with it.

2. Repayment Obligation. If the Employee voluntarily resigns within twelve months of completing the program, the Employee shall repay the training costs on the schedule in Annex A.

3. General. This Agreement is the entire agreement of the parties regarding its subject matter and supersedes prior discussions.`,
  },
  {
    id: "nda",
    title: "The NDA",
    blurb: "Two parties, one secret, a three-year tail.",
    text: `MUTUAL NON-DISCLOSURE AGREEMENT

This Agreement is entered into as of the Effective Date between the parties identified below, each a "Party."

WHEREAS the Parties wish to explore a business relationship and may disclose confidential information to one another;

WHEREAS the Parties wish to define the terms governing that disclosure;

NOW, THEREFORE, the Parties agree as follows:

1. Confidential Information. "Confidential Information" means any non-public information disclosed by one Party to the other, whether orally or in writing.

2. Obligations. The receiving Party shall protect Confidential Information with at least the degree of care it uses for its own confidential information, and no less than reasonable care.

3. Term. The obligations in this Agreement continue for three years from the date of disclosure.`,
  },
];
