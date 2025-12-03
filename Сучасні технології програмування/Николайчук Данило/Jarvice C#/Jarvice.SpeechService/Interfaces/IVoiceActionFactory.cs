using Jarvice.SpeechService.Enums;

namespace Jarvice.SpeechService.Interfaces;

public interface IVoiceActionFactory
{
	IVoiceAction GetAction(VoiceResponse response);
}
