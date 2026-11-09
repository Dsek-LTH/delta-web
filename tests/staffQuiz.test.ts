import { describe, expect, test } from "bun:test";
import { matchStaffRoles, staffQuiz } from "../src/constants";

describe("matchStaffRoles", () => {
  test("keeps role order when nothing is answered", () => {
    expect(matchStaffRoles({}, 3)).toEqual([
      "company",
      "nightWatch",
      "infoDesk",
    ]);
  });

  test("scores a yes to the question's yes-list", () => {
    const allYes = Object.fromEntries(staffQuiz.map((q) => [q.id, true]));
    expect(matchStaffRoles(allYes)).toEqual([
      "logistics",
      "amenities",
      "company",
    ]);
  });

  test("scores a no to the question's no-list", () => {
    const allNo = Object.fromEntries(staffQuiz.map((q) => [q.id, false]));
    expect(matchStaffRoles(allNo)).toEqual([
      "nightWatch",
      "electricity",
      "company",
    ]);
  });

  test("uses the no-list for a single answered question", () => {
    expect(matchStaffRoles({ team: false })).toEqual([
      "company",
      "nightWatch",
      "infoDesk",
    ]);
  });
});
