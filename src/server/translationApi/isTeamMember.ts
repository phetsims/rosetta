// Copyright 2025, University of Colorado Boulder

/**
 * Function that takes an Express request object and returns a boolean indicating whether the user is a team member.
 * This determination is made based on the presence and value of a query parameter in the request.
 *
 * @param req - Express request object
 * @returns - a boolean indicating whether the user is a team member
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import { Request } from 'express';

const isTeamMember = ( req: Request ): boolean => typeof req.query.isTeamMember !== 'undefined' &&
                                                  req.query.isTeamMember === 'true';

export default isTeamMember;