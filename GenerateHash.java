import org.mindrot.jbcrypt.BCrypt;

public class GenerateHash {
    public static void main(String[] args) {
        String[] passwords = {"SuperAdmin2026!", "Admin2026!", "claire2026", "thomas2026", "amina2026", "lucas2026", "fatima2026"};
        for (String p : passwords) {
            System.out.println(p + " => " + BCrypt.hashpw(p, BCrypt.gensalt(12)));
        }
    }
}
