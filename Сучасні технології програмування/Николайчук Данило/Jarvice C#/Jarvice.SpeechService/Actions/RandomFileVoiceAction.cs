using Jarvice.SpeechService.Interfaces;
using System.Media;

namespace Jarvice.SpeechService.Actions;

public class RandomFileVoiceAction : IVoiceAction
{
	private readonly string[] _filePaths;
	private readonly Random _random = new();

	public RandomFileVoiceAction(params string[] filePaths)
	{
		_filePaths = filePaths;
	}

	public void Speak(string text)
	{
		var existingFiles = _filePaths.Where(File.Exists).ToArray();
		if (existingFiles.Length == 0)
		{
			Console.WriteLine("No valid files found, fallback to text: " + text);
			return;
		}

		var chosenFile = existingFiles[_random.Next(existingFiles.Length)];
		using var player = new SoundPlayer(chosenFile);
		player.Play();
	}
}