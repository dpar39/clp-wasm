const fs = require('fs');

function almostEq(a, b, tol) {
  tol = tol || 0.01;
  return Math.abs(a - b) < tol;
}

const rebench = false;
let glpk = null;
try {
  glpk = require('glpk');
} catch (e) {
  console.log("Not validating against GLPK");
}

let solver = null;
describe("clp-wasm test suite", () => {

  beforeAll(async () => {
    solver = await require("../clp-wasm.all");
  });

  test("Can solve problems in LP format", async () => {
    const lpProblemFiles = ['diet_large', 'lp', 'tinlake', 'big_numbers'];
    for (const fileName of lpProblemFiles) {

      const lpFile = `${__dirname}/data/${fileName}.lp`;
      const lpBench = `${__dirname}/bench/${fileName}.json`;
      const lpContent = fs.readFileSync(lpFile, "utf8");

      const result = await solver.solve(lpContent);

      if (fs.existsSync(lpBench) && !rebench) {
        const expected = JSON.parse(fs.readFileSync(lpBench, "utf8"));
        expect(expected).toMatchObject(result);
      }
      else {
        console.log(`Rebencing problem ${lpProblemFiles}`)
        const benchcontent = JSON.stringify(result);
        fs.writeFileSync(lpBench, benchcontent, "utf8");
      }

      if (glpk) {
        // Solve problem using node-glpk for cross validation
        let prob = new glpk.Problem();
        prob.readLpSync(lpFile);
        prob.scaleSync(glpk.SF_AUTO);
        prob.simplexSync({
          presolve: glpk.ON,
          msgLev: glpk.MSG_ERR
        });
        let z1 = 0;
        if (prob.getNumInt() > 0) {
          prob.intoptSync();
          z1 = prob.mipObjVal();
        } else {
          z1 = prob.getObjVal()
        }
        prob.delete();

        // Solve using this library
        const result = solver.solve(lpContent);
        const z2 = Number(result.objectiveValue);
        expect(almostEq(z1, z2)).toBeTruthy();
      }
    }
  });

  test("test best integer floor ceiling search", async () => {
    const lpProblemFiles = ['lp', 'tinlake'];
    for (const fileName of lpProblemFiles) {

      const lpFile = `${__dirname}/data/${fileName}.lp`;
      const lpBench = `${__dirname}/bench/${fileName}_integer.json`;
      const lpContent = fs.readFileSync(lpFile, "utf8");

      const result = await solver.solve(lpContent, 0);

      if (fs.existsSync(lpBench) && !rebench) {
        const expected = JSON.parse(fs.readFileSync(lpBench, "utf8"));
        expect(expected).toMatchObject(result);
      }
      else {
        console.log(`Rebencing problem ${lpProblemFiles}`)
        const benchcontent = JSON.stringify(result);
        fs.writeFileSync(lpBench, benchcontent, "utf8");
      }
    }
  });

  test("get CLP version", async () => {
    const version = await solver.version();
    expect(version).toBe("1.17.3");
  });


  test("big number string rounding", async () => {
    expect(await solver.bnRound("1999.9999999999999999")).toBe("2000");
    expect(await solver.bnRound("1999.4999999999999999")).toBe("1999");
    expect(await solver.bnRound("1999999999999999999999999999999999999999.9999999999999999")).toBe("2000000000000000000000000000000000000000");
    expect(await solver.bnRound("1999999999999999999999999999999999999999.4999999999999999")).toBe("1999999999999999999999999999999999999999");
  });

  test("big number string ceiling", async () => {
    expect(await solver.bnCeil("1999.9999999999999999")).toBe("2000");
    expect(await solver.bnCeil("1999.4999999999999999")).toBe("2000");
    expect(await solver.bnCeil("1999999999999999999999999999999999999999.9999999999999999")).toBe("2000000000000000000000000000000000000000");
    expect(await solver.bnCeil("1999999999999999999999999999999999999999.4999999999999999")).toBe("2000000000000000000000000000000000000000");
  });

  test("big number string flooring", async () => {
    expect(await solver.bnFloor("1999.9999999999999999")).toBe("1999");
    expect(await solver.bnFloor("1999.4999999999999999")).toBe("1999");
    expect(await solver.bnFloor("1999999999999999999999999999999999999999.9999999999999999")).toBe("1999999999999999999999999999999999999999");
    expect(await solver.bnFloor("1999999999999999999999999999999999999999.4999999999999999")).toBe("1999999999999999999999999999999999999999");
  });


  test("Clp solve: tinlake problem large", async () => {
    const lpContent = `Maximize
    obj: +10000 tinInvest +1000 dropInvest +100000 tinRedeem +1000000 dropRedeem 
  Subject To
    reserve: tinInvest + dropInvest - tinRedeem - dropRedeem  >= -200000000000000000001
    maxReserve: tinInvest + dropInvest - tinRedeem - dropRedeem  <= 9800000000000000000000
    minTINRatioLb: +850000000000000000000000000 tinInvest -150000000000000000000000000 dropInvest -850000000000000000000000000 tinRedeem +150000000000000000000000000 dropRedeem  >= -50000000000000000000000000000000000000000000000
    maxTINRatioLb: -800000000000000000000000000 tinInvest +200000000000000000000000000 dropInvest +800000000000000000000000000 tinRedeem -200000000000000000000000000 dropRedeem  >= 0
  Bounds
    0 <= tinInvest  <= 200000000000000000000
    0 <= dropInvest <= 400000000000000000000
    0 <= tinRedeem  <= 100000000000000000000
    0 <= dropRedeem <= 300000000000000000000
  End`
    const result = await solver.solve(lpContent);
  });
});

