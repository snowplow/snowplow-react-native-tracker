import Foundation
import SnowplowTracker

class Utilities {
    
    static func getBasis(_ basis: String) -> GDPRProcessingBasis {
        switch basis {
        case "consent":
            return .consent
        case "contract":
            return .contract
        case "legal_obligation":
            return .legalObligation
        case "legitimate_interests":
            return .legitimateInterests
        case "public_task":
            return .publicTask
        default:
            return .vitalInterest
        }
    }
    
    static func mkSDJArray(_ sdjArray: NSArray) -> [SelfDescribingJson] {
        return sdjArray.map { sdj in
            if let sdj = sdj as? NSDictionary,
               let schema = sdj.object(forKey: "schema") as? String,
               let dict = sdj.object(forKey: "data") as? Dictionary<String, Any> {
                
                let nativeSdj = SelfDescribingJson(schema: schema, andDictionary: dict)
                return nativeSdj
            } else {
                return nil
            }
        }.compactMap { $0 }
    }
    
}
