/* $Id: ClpSimplexNonlinear.hpp 2385 2019-01-06 19:43:06Z unxusr $ */
// Copyright (C) 2004, International Business Machines
// Corporation and others.  All Rights Reserved.
// This code is licensed under the terms of the Eclipse Public License (EPL).
/*
   Authors

   John Forrest

 */
#ifndef ClpSimplexNonlinear_H
#define ClpSimplexNonlinear_H

class ClpNonlinearInfo;
class ClpQuadraticObjective;
class ClpConstraint;

#include "ClpSimplexPrimal.hpp"

/** This solves non-linear LPs using the primal simplex method

    It inherits from ClpSimplexPrimal.  It has no data of its own and
    is never created - only cast from a ClpSimplexPrimal object at algorithm time.
    If needed create new class and pass around

*/

class ClpSimplexNonlinear : public ClpSimplexPrimal {

public:
  /**@name Description of algorithm */
  //@{
  /** Primal algorithms for reduced gradient
         At present we have two algorithms:

     */
  /// A reduced gradient method.
  int primal();
  /** Primal algorithm for quadratic
         Using a semi-trust region approach as for pooling problem
         This is in because I have it lying around
     */
  int primalSLP(int numberPasses, FloatT deltaTolerance,
    int otherOptions = 0);
  /// May use a cut approach for solving any LP
  int primalDualCuts(char *rowsIn, int startUp, int algorithm);
  /** Primal algorithm for nonlinear constraints
         Using a semi-trust region approach as for pooling problem
         This is in because I have it lying around

     */
  int primalSLP(int numberConstraints, ClpConstraint **constraints,
    int numberPasses, FloatT deltaTolerance);

  /** Creates direction vector.  note longArray is long enough
         for rows and columns.  If numberNonBasic 0 then is updated
         otherwise mode is ignored and those are used.
         Norms are only for those > 1.0e3*dualTolerance
         If mode is nonzero then just largest dj */
  void directionVector(CoinIndexedVector *longArray,
    CoinIndexedVector *spare1, CoinIndexedVector *spare2,
    int mode,
    FloatT &normFlagged, FloatT &normUnflagged,
    int &numberNonBasic);
  /// Main part.
  int whileIterating(int &pivotMode);
  /**
         longArray has direction
         pivotMode -
               0 - use all dual infeasible variables
           1 - largest dj
           while >= 10 trying startup phase
         Returns 0 - can do normal iteration (basis change)
         1 - no basis change
         2 - if wants singleton
         3 - if time to re-factorize
         If sequenceIn_ >=0 then that will be incoming variable
     */
  int pivotColumn(CoinIndexedVector *longArray,
    CoinIndexedVector *rowArray,
    CoinIndexedVector *columnArray,
    CoinIndexedVector *spare,
    int &pivotMode,
    FloatT &solutionError,
    FloatT *array1);
  /**  Refactorizes if necessary
          Checks if finished.  Updates status.
          lastCleaned refers to iteration at which some objective/feasibility
          cleaning too place.

          type - 0 initial so set up save arrays etc
               - 1 normal -if good update save
           - 2 restoring from saved
     */
  void statusOfProblemInPrimal(int &lastCleaned, int type,
    ClpSimplexProgress *progress,
    bool doFactorization,
    FloatT &bestObjectiveWhenFlagged);
  /** Do last half of an iteration.
         Return codes
         Reasons to come out normal mode
         -1 normal
         -2 factorize now - good iteration
         -3 slight inaccuracy - refactorize - iteration done
         -4 inaccuracy - refactorize - no iteration
         -5 something flagged - go round again
         +2 looks unbounded
         +3 max iterations (iteration done)

     */
  int pivotNonlinearResult();
  //@}
};
#endif

/* vi: softtabstop=2 shiftwidth=2 expandtab tabstop=2
*/