using System.Media;
using Jarvice.SpeechService.Interfaces;

namespace Jarvice.SpeechService.Actions;

public class FileVoiceAction : IVoiceAction
{
	private readonly string _filePath;

	public FileVoiceAction(string filePath)
	{
		_filePath = filePath;
	}

	public void Speak(string text)
	{
		if (File.Exists(_filePath))
		{
			using var player = new SoundPlayer(_filePath);
			player.Play();
		}
		else
		{
			Console.WriteLine($"File not found: {_filePath}");
		}
	}
}
