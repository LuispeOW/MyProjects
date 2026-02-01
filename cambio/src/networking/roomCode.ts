// Room code generation and IP encoding/decoding

// Characters used for room codes (avoiding confusable characters)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  // No I, O, 0, 1

// Generate a random room code (4 characters)
export const generateRoomCode = (): string => {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
};

// Encode IP address to room code
// Format: Takes last two octets (192.168.X.Y) and port, encodes to 6 chars
export const encodeIPToRoomCode = (ip: string, port: number = 3000): string => {
  const parts = ip.split('.');
  if (parts.length !== 4) return generateRoomCode();

  const lastTwo = parseInt(parts[2]) * 256 + parseInt(parts[3]);
  const portOffset = port - 3000;  // Assume ports near 3000

  // Encode as base-32
  const value = lastTwo * 100 + (portOffset % 100);
  let code = '';
  let remaining = value;

  for (let i = 0; i < 4; i++) {
    code = CODE_CHARS[remaining % 32] + code;
    remaining = Math.floor(remaining / 32);
  }

  return code;
};

// Decode room code back to IP parts (returns last two octets)
// Note: First two octets must be discovered via network scanning
export const decodeRoomCode = (code: string): { subnet: number; host: number; port: number } | null => {
  if (code.length !== 4) return null;

  let value = 0;
  for (const char of code.toUpperCase()) {
    const index = CODE_CHARS.indexOf(char);
    if (index === -1) return null;
    value = value * 32 + index;
  }

  const portOffset = value % 100;
  const ipParts = Math.floor(value / 100);

  return {
    subnet: Math.floor(ipParts / 256),
    host: ipParts % 256,
    port: 3000 + portOffset,
  };
};

// Validate room code format
export const isValidRoomCode = (code: string): boolean => {
  if (code.length !== 4) return false;
  return code.toUpperCase().split('').every(char => CODE_CHARS.includes(char));
};

// For local network games, we'll try common subnets
export const COMMON_SUBNETS = [
  '192.168.1',
  '192.168.0',
  '10.0.0',
  '10.0.1',
  '172.16.0',
];

// Build possible IP addresses from room code
export const getPossibleIPs = (code: string): string[] => {
  const decoded = decodeRoomCode(code);
  if (!decoded) return [];

  const ips: string[] = [];
  for (const subnet of COMMON_SUBNETS) {
    const parts = subnet.split('.');
    if (parts.length === 3) {
      ips.push(`${parts[0]}.${parts[1]}.${decoded.subnet}.${decoded.host}`);
    }
  }

  // Also try with the decoded subnet directly
  ips.push(`192.168.${decoded.subnet}.${decoded.host}`);
  ips.push(`10.0.${decoded.subnet}.${decoded.host}`);

  return [...new Set(ips)];  // Remove duplicates
};
