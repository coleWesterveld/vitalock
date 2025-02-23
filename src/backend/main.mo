import Array "mo:base/Array";  // Add this line


actor Backend {
  stable var messages : [Text] = [];

  public func write_message(msg : Text) : async () {
    // Use Array.append for immutable arrays
    messages := Array.append<Text>(messages, [msg]);
  };

  public query func read_messages() : async [Text] {
    messages
  };
}