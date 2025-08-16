/**
 * @swagger
 * /api/v1/root:
 *   get:
 *     summary: Ping the server
 *     description: Returns the current date and time
 *     tags:
 *       - root
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ping:
 *                     type: string
 *                     example: pong
 * 
 */
export async function GET() {
    return new Response(JSON.stringify([{ ping: "pong" }]));
}
